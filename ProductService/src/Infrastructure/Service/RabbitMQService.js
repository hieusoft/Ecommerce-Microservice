const amqplib = require('amqplib');
const IRabbitMqService = require('../../Application/Interfaces/IRabbitMqService');

class RabbitMqService extends IRabbitMqService {
    constructor(url) {
        super();
        this.url = url;
        this.connection = null;
        this.channels = new Map();
    }

    async _getOrCreateChannel(key) {
        if (this.channels.has(key)) return this.channels.get(key);

        if (!this.connection)
            this.connection = await amqplib.connect(this.url);

        const channel = await this.connection.createChannel();
        this.channels.set(key, channel);
        return channel;
    }

    async declareExchange(exchangeName, exchangeType = 'direct') {
        const channel = await this._getOrCreateChannel(`exchange:${exchangeName}`);
        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
    }

    async declareQueueAndBind(queueName, exchangeName, routingKeys = []) {
        const channel = await this._getOrCreateChannel(`queue:${queueName}`);

        await channel.assertQueue(queueName, {
            durable: true,
            exclusive: false,
            autoDelete: false
        });

        for (const key of routingKeys) {
            await channel.bindQueue(queueName, exchangeName, key);
        }
    }

    async publish(exchangeName, routingKey, message) {
        const channel = await this._getOrCreateChannel(`exchange:${exchangeName}`);

        const body = Buffer.from(JSON.stringify(message));

        channel.publish(exchangeName, routingKey, body, {
            persistent: true
        });
    }

    async consume(queueName, onMessage) {
        const channel = await this._getOrCreateChannel(`queue:${queueName}`);

        await channel.consume(queueName, msg => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                onMessage(data);
                channel.ack(msg);
            }
        });
    }

    async close() {
        for (const ch of this.channels.values()) {
            await ch.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}

module.exports = RabbitMqService;
