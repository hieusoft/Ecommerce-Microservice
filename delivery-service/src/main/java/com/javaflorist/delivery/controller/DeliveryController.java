package com.javaflorist.delivery.controller;

import org.springframework.web.bind.annotation.*;
import com.javaflorist.delivery.dto.DeliveryEventDto;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    @GetMapping("/")
    public String health() {
        return "Delivery service running";
    }

    @PostMapping("/event")
    public String publishEvent(@RequestBody DeliveryEventDto dto) {
        return "Event received: " + dto.getMessage();
    }
    @GetMapping("/{id}")
    public String getDelivery(@PathVariable Integer id) {
        return "Delivery with ID: " + id;
    }

}
