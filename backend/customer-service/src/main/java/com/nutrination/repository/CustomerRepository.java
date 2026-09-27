package com.nutrination.repository;

import com.nutrination.entity.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByEmailIgnoreCase(String email);
}
