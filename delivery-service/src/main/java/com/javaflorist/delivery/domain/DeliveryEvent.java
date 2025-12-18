package com.javaflorist.delivery.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_event")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer orderId;
    private String status;
    private String queueName;

    @Column(columnDefinition = "TEXT")
    private String message;
}
