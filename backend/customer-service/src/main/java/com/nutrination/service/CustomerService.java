package com.nutrination.service;

import com.nutrination.entity.Customer;
import com.nutrination.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
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
            customer.setId("cust-" + System.currentTimeMillis());
        }
        if (customer.getJoinedDate() == null) {
            customer.setJoinedDate(LocalDate.now());
        }
        customer.syncAddresses();
        return customerRepository.save(customer);
    }
}
