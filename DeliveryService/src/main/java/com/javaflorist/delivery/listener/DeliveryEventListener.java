package com.javaflorist.delivery.listener;

import com.javaflorist.delivery.dto.DeliveryEventDto;
import com.javaflorist.delivery.service.DeliveryEventService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class DeliveryEventListener {

    private final DeliveryEventService service;

    public DeliveryEventListener(DeliveryEventService service) {
        this.service = service;
    }

    @RabbitListener(queues = "delivery.started")
    public void handleDeliveryStarted(String message) {
        service.process(new DeliveryEventDto("delivery.started", message));
    }

    @RabbitListener(queues = "delivery.in_transit")
    public void handleDeliveryInTransit(String message) {
        service.process(new DeliveryEventDto("delivery.in_transit", message));
    }

    @RabbitListener(queues = "delivery.completed")
    public void handleDeliveryCompleted(String message) {
        service.process(new DeliveryEventDto("delivery.completed", message));
    }

    @RabbitListener(queues = "delivery.failed")
    public void handleDeliveryFailed(String message) {
        service.process(new DeliveryEventDto("delivery.failed", message));
    }
}
