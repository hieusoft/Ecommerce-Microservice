package com.javaflorist.delivery.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javaflorist.delivery.domain.Delivery;
import com.javaflorist.delivery.domain.DeliveryEvent;
import com.javaflorist.delivery.dto.DeliveryEventDto;
import com.javaflorist.delivery.repository.DeliveryEventRepository;
import com.javaflorist.delivery.repository.DeliveryRepository;
import org.springframework.stereotype.Service;

@Service
public class DeliveryEventService {

    private final DeliveryEventRepository eventRepo;
    private final DeliveryRepository deliveryRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DeliveryEventService(DeliveryEventRepository eventRepo, DeliveryRepository deliveryRepo) {
        this.eventRepo = eventRepo;
        this.deliveryRepo = deliveryRepo;
    }

    public void process(DeliveryEventDto dto) {
        try {
            // Parse JSON message
            JsonNode json = objectMapper.readTree(dto.getMessage());

            Integer orderId = json.has("orderId") ? json.get("orderId").asInt() : null;
            String status = json.has("status") ? json.get("status").asText() : null;

            // Create event
            DeliveryEvent event = new DeliveryEvent();
            event.setQueueName(dto.getQueueName());
            event.setMessage(dto.getMessage()); // raw → sửa thành dto.getMessage()

            if (orderId != null) {
                event.setOrderId(String.valueOf(orderId)); // FIX LỖI Integer → String
            }

            if (status != null) {
                event.setStatus(status);
            }

            // Lưu event
            eventRepo.save(event);

            // Nếu có orderId thì update bảng delivery
            if (orderId != null) {

                Delivery d = deliveryRepo.findByOrderId(orderId);

                if (d != null) {
                    d.setStatus(status);
                    deliveryRepo.save(d);
                }
            }

            System.out.println("✔ Saved event & updated delivery: " + dto.getQueueName());

        } catch (Exception ex) {
            ex.printStackTrace();
            System.out.println("❌ Error processing event");
        }
    }
}
