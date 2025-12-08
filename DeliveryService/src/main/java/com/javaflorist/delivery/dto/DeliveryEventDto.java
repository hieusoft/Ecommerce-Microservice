package com.javaflorist.delivery.dto;

public class DeliveryEventDto {

    private String queueName;
    private String message;


    public DeliveryEventDto() {}

    public DeliveryEventDto(String queueName, String message) {
        this.queueName = queueName;
        this.message = message;
    }

    public String getQueueName() {
        return queueName;
    }

    public void setQueueName(String queueName) {
        this.queueName = queueName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
