package com.nutrination.repository;

import com.nutrination.entity.CustomerOrder;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<CustomerOrder, String> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
}
