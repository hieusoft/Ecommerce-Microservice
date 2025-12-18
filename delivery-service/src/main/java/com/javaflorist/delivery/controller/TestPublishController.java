package com.javaflorist.delivery.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestPublishController {

    private final RabbitTemplate rabbitTemplate;

    public TestPublishController(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping("/{queue}")
    public String publish(@PathVariable String queue, @RequestBody String body) {
        rabbitTemplate.convertAndSend("delivery.exchange", queue, body);
        return "Sent to " + queue;
    }
}
