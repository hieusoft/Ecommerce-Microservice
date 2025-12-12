package com.javaflorist.delivery.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_id")
    private Integer deliveryId;

    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "shipper_id")
    private Integer shipperId;

    @Column(length = 30)
    private String status;

    @Column(name = "expected_time")
    private LocalDateTime expectedTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
