package com.javaflorist.delivery.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String QUEUE_STARTED = "delivery.started";
    public static final String QUEUE_IN_TRANSIT = "delivery.in_transit";
    public static final String QUEUE_COMPLETED = "delivery.completed";
    public static final String QUEUE_FAILED = "delivery.failed";
    public static final String EXCHANGE = "delivery.exchange";

    @Bean
    public Queue startedQueue() {
        return new Queue(QUEUE_STARTED, true);
    }

    @Bean
    public Queue inTransitQueue() {
        return new Queue(QUEUE_IN_TRANSIT, true);
    }

    @Bean
    public Queue completedQueue() {
        return new Queue(QUEUE_COMPLETED, true);
    }

    @Bean
    public Queue failedQueue() {
        return new Queue(QUEUE_FAILED, true);
    }

    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Binding bindStarted(Queue startedQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(startedQueue).to(directExchange).with(QUEUE_STARTED);
    }

    @Bean
    public Binding bindInTransit(Queue inTransitQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(inTransitQueue).to(directExchange).with(QUEUE_IN_TRANSIT);
    }

    @Bean
    public Binding bindCompleted(Queue completedQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(completedQueue).to(directExchange).with(QUEUE_COMPLETED);
    }

    @Bean
    public Binding bindFailed(Queue failedQueue, DirectExchange directExchange) {
        return BindingBuilder.bind(failedQueue).to(directExchange).with(QUEUE_FAILED);
    }
}
