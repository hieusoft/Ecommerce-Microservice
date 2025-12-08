package com.javaflorist.delivery.controller;

import com.javaflorist.delivery.dto.DeliveryEventDto;
import com.javaflorist.delivery.service.DeliveryEventService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final DeliveryEventService eventService;

    public DeliveryController(DeliveryEventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/event")
    public String receiveEvent(@RequestBody DeliveryEventDto dto) {
        eventService.process(dto);
        return "Event processed";
    }

    @GetMapping("/")
    public String health() {
        return "Delivery service running";
    }
}
