package com.nutrination.service;

import com.nutrination.entity.Customer;
import com.nutrination.repository.CustomerRepository;
import com.nutrination.security.GoogleTokenVerifier;
import com.nutrination.security.LoginAttemptLimiter;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptLimiter loginAttempts;
    /**
     * Checked against when the email has no account, so a wrong email takes as long as
     * a wrong password and response times don't reveal who has an account.
     */
    private final String unknownAccountHash;

    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder,
                           LoginAttemptLimiter loginAttempts) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginAttempts = loginAttempts;
        this.unknownAccountHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /** Random, so ids can't be guessed or collide when two people sign up at once. */
    private static String newCustomerId() {
        return "cust-" + UUID.randomUUID();
    }

    @Transactional(readOnly = true)
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Customer findById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
    }

    @Transactional(readOnly = true)
    public Customer findByEmail(String email) {
        return customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + email));
    }

    @Transactional
    public Customer save(Customer customer) {
        if (customer.getId() == null || customer.getId().isBlank()) {
            customer.setId(newCustomerId());
        }
        if (customer.getJoinedDate() == null) {
            customer.setJoinedDate(LocalDate.now());
        }
        customer.syncAddresses();
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer register(String name, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (customerRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for that email address");
        }
        Customer customer = new Customer();
        customer.setId(newCustomerId());
        customer.setName(name.trim());
        customer.setEmail(normalizedEmail);
        customer.setRole("CUSTOMER");
        customer.setPasswordHash(passwordEncoder.encode(password));
        return customerRepository.save(customer);
    }

    /**
     * Signs in with an identity Google has verified. Finds the account by Google id,
     * then by email (Google has confirmed the person owns that address, so an existing
     * password account is linked rather than duplicated), and otherwise creates one.
     */
    @Transactional
    public Customer signInWithGoogle(GoogleTokenVerifier.GoogleIdentity identity) {
        String email = identity.email().trim().toLowerCase(Locale.ROOT);
        Customer customer = customerRepository.findByGoogleSubject(identity.subject())
                .or(() -> customerRepository.findByEmailIgnoreCase(email))
                .orElse(null);

        if (customer == null) {
            customer = new Customer();
            customer.setId(newCustomerId());
            customer.setName(identity.name().trim());
            customer.setEmail(email);
            customer.setRole("CUSTOMER");
        }
        if ("suspended".equalsIgnoreCase(customer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This account has been suspended. Please contact customer support.");
        }
        if (customer.getGoogleSubject() == null) {
            customer.setGoogleSubject(identity.subject());
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer authenticate(String email, String password) {
        if (loginAttempts.isLocked(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many sign-in attempts. Please wait 15 minutes and try again.");
        }

        Customer customer = customerRepository.findByEmailIgnoreCase(email.trim()).orElse(null);
        String hash = customer == null || customer.getPasswordHash() == null ? unknownAccountHash : customer.getPasswordHash();
        boolean matches = passwordEncoder.matches(password, hash);
        if (customer == null || customer.getPasswordHash() == null || !matches) {
            loginAttempts.recordFailure(email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        loginAttempts.recordSuccess(email);

        if ("suspended".equalsIgnoreCase(customer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This account has been suspended. Please contact customer support.");
        }
        // Accounts migrated with an older hash move to the current one on first sign-in.
        if (passwordEncoder.upgradeEncoding(customer.getPasswordHash())) {
            customer.setPasswordHash(passwordEncoder.encode(password));
            customerRepository.save(customer);
        }
        return customer;
    }
}
