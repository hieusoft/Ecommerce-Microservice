class OrderCoupon {
    constructor(order_id, coupon_id, updated_at) {
        this.order_id = order_id;    
        this.coupon_id = coupon_id;
        this.updated_at = updated_at;  
    }
}

module.exports = OrderCoupon;
