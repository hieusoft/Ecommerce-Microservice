const CouponService = require("../Service/CouponService");

class CouponConsumer {
    constructor(rabbitMQService, dbPool) {
        this.rabbitMQService = rabbitMQService;
        this.dbPool = dbPool;
    }

    async start() {
        const queueName = 'order.coupon_q';
        await this.rabbitMQService.consume(queueName, async (data) => {
            try {
                console.log("Received message in CouponConsumer:", data);
                const { coupon_id, order_id, user_id } = data;
                const apply = await CouponService.applyToOrder(this.dbPool, {
                    coupon_id,
                    order_id,
                    user_id
                });

                if (!apply.success) {
                    console.log("Failed to apply coupon:", apply.reason);

            
                    return;
                }
                console.log(`Coupon applied successfully for order ${order_id}`);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        console.log(`Consumer started, listening to queue: ${queueName}`);
    }
}

module.exports = CouponConsumer;