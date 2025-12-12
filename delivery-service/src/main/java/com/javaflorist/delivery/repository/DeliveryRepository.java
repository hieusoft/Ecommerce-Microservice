package com.javaflorist.delivery.repository;

import com.javaflorist.delivery.domain.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
    Delivery findByOrderId(Integer orderId);
}
