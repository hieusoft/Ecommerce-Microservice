package com.javaflorist.delivery.listener;

import com.javaflorist.delivery.dto.DeliveryEventDto;
import com.javaflorist.delivery.service.DeliveryEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeliveryEventListener {

    private final DeliveryEventService service;

    @RabbitListener(queues = "delivery.started")
    public void onStarted(String msg) {
        service.process(new DeliveryEventDto(1, "started", "delivery.started", msg));
    }

    @RabbitListener(queues = "delivery.in_transit")
    public void onTransit(String msg) {
        service.process(new DeliveryEventDto(1, "in_transit", "delivery.in_transit", msg));
    }

    @RabbitListener(queues = "delivery.completed")
    public void onCompleted(String msg) {
        service.process(new DeliveryEventDto(1, "completed", "delivery.completed", msg));
    }

    @RabbitListener(queues = "delivery.failed")
    public void onFailed(String msg) {
        service.process(new DeliveryEventDto(1, "failed", "delivery.failed", msg));
    }
}
