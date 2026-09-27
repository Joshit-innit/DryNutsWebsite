package com.nutrination.config;

import com.nutrination.entity.Address;
import com.nutrination.entity.Customer;
import com.nutrination.repository.CustomerRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedCustomers(CustomerRepository customerRepository) {
        return args -> {
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
            admin.setEmail("admin@nutrination.in");
            admin.setPhone("+91 90000 00000");
            admin.setRole("admin");
            customerRepository.save(admin);
        };
    }
}
