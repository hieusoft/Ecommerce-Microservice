package com.javaflorist.delivery.service;

import com.javaflorist.delivery.domain.Delivery;
import com.javaflorist.delivery.domain.DeliveryEvent;
import com.javaflorist.delivery.dto.DeliveryEventDto;
import com.javaflorist.delivery.repository.DeliveryEventRepository;
import com.javaflorist.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryEventService {

    private final DeliveryEventRepository eventRepo;
    private final DeliveryRepository deliveryRepo;

    public void process(DeliveryEventDto dto) {


        DeliveryEvent event = DeliveryEvent.builder()
                .orderId(dto.getOrderId())
                .status(dto.getStatus())
                .queueName(dto.getQueueName())
                .message(dto.getMessage())
                .build();
        eventRepo.save(event);


        if (dto.getOrderId() != null) {
            Delivery d = deliveryRepo.findByOrderId(dto.getOrderId());
            if (d != null) {
                d.setStatus(dto.getStatus());
                deliveryRepo.save(d);
            }
        }

        System.out.println("✔ Event saved: " + dto.getQueueName());
    }
}
