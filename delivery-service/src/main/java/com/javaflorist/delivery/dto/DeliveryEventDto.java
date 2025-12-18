package com.javaflorist.delivery.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryEventDto {
    private Integer orderId;
    private String status;
    private String queueName;
    private String message;
}
