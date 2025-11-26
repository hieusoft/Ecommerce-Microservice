class IRabbitMqService {
    async declareExchange(exchangeName, exchangeType) {
        throw new Error('Method not implemented');
    }

    async declareQueueAndBind(queueName, exchangeName, routingKeys) {
        throw new Error('Method not implemented');
    }

    async publish(exchangeName, routingKey, message) {
        throw new Error('Method not implemented');
    }

    async consume(queueName, onMessage) {
        throw new Error('Method not implemented');
    }

    async close() {
        throw new Error('Method not implemented');
    }
}

module.exports = IRabbitMqService;