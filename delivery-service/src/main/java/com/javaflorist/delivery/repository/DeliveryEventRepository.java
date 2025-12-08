package com.javaflorist.delivery.repository;

import com.javaflorist.delivery.domain.DeliveryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryEventRepository
        extends JpaRepository<DeliveryEvent, Long> {
}
