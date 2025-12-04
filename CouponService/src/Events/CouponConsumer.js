const CouponService = require("../Service/CouponService");

class CouponConsumer {
    constructor(rabbitMQService, dbPool) {
        this.rabbitMQService = rabbitMQService;
        this.dbPool = dbPool;
    }

    async start() {
        const queueName = 'order.created_coupon_q';
        await this.rabbitMQService.consume(queueName, async (data) => {
            try {
                const user_id1 = jwtUserService.getUserIdFromRequest(req);
                console.log("User ID from JWT:", user_id1);    
                const { order_id, coupon_code, total_price, user_id, currentOccasion } = data;

                if (!coupon_code) {
                    console.log('No coupon code provided for order:', order_id);
                    return;
                }

                console.log(`Processing coupon code ${coupon_code} for order ${total_price}`);
                const validation = await CouponService.validate(this.dbPool, coupon_code, total_price, currentOccasion);

                if (!validation.valid) {
                    console.log('Invalid coupon:', validation.reason);
                    await this.rabbitMQService.publish(
                        'coupon_events',
                        'coupon.validated',
                        {
                            order_id,
                            valid: false,
                            reason: validation.reason
                        }
                    );
                    return;
                }

                let discountAmount = 0;
                if (validation.discount_type === 'percent') {
                    discountAmount = total_price * (validation.discount_value / 100);
                } else if (validation.discount_type === 'amount') {
                    discountAmount = validation.discount_value;
                }

                const apply = await CouponService.applyToOrder(this.dbPool, {
                    coupon_id: validation.coupon_id,
                    order_id,
                    user_id
                });

                if (!apply.success) {
                    console.log("Failed to apply coupon:", apply.reason);

                    await this.rabbitMQService.publish(
                        'coupon_events',
                        'coupon.validated',
                        {
                            order_id,
                            valid: false,
                            reason: apply.reason
                        }
                    );
                    return;
                }


                await this.rabbitMQService.publish(
                    'coupon_events',
                    'coupon.validated',
                    {
                        order_id,
                        coupon_id: validation.coupon_id,
                        discount_amount: discountAmount,
                        valid: true
                    }
                );

                console.log(`Coupon applied successfully for order ${order_id}`);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        });

        console.log(`Consumer started, listening to queue: ${queueName}`);
    }
}

module.exports = CouponConsumer;