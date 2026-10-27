package com.nutrination.config;

import com.nutrination.entity.Address;
import com.nutrination.entity.Customer;
import com.nutrination.repository.CustomerRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedCustomers(CustomerRepository customerRepository,
                                    PasswordEncoder passwordEncoder,
                                    @Value("${seed.admin.email}") String adminEmail,
                                    @Value("${seed.admin.password}") String adminPassword) {
        return args -> {
            // Older databases were seeded without a password hash, which made the admin unable to sign in.
            customerRepository.findByEmailIgnoreCase(adminEmail).ifPresent(existing -> {
                if (existing.getPasswordHash() == null) {
                    existing.setPasswordHash(passwordEncoder.encode(adminPassword));
                    customerRepository.save(existing);
                }
            });
            if (customerRepository.count() > 0) {
                return;
            }
            Customer customer = new Customer();
            customer.setId("cust-1");
            customer.setName("Chandu Tammana");
            customer.setEmail("chandu@nutrination.in");
            customer.setPhone("+91 98765 43210");
            customer.setRole("customer");
            customer.setTotalOrders(2);
            customer.setTotalSpend(BigDecimal.valueOf(4498));
            customer.setJoinedDate(LocalDate.now().minusMonths(3));

            Address address = new Address();
            address.setId("addr-1");
            address.setName("Chandu Tammana");
            address.setPhone("+91 98765 43210");
            address.setStreet("12 Orchard Residency");
            address.setCity("Hyderabad");
            address.setState("Telangana");
            address.setPincode("500001");
            address.setIsDefault(true);
            customer.setAddresses(List.of(address));
            customerRepository.save(customer);

            Customer admin = new Customer();
            admin.setId("admin-1");
            admin.setName("NutriNation Admin");
            admin.setEmail(adminEmail);
            admin.setPhone("+91 90000 00000");
            admin.setRole("admin");
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            customerRepository.save(admin);
        };
    }
}
