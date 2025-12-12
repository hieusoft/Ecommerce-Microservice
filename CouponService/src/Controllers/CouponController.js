const CouponService = require('../Service/CouponService');
const { getUserFromToken } = require('../Service/JwtUserService');

class CouponController {
    constructor(rabbitMQService) {
        this.rabbitMQService = rabbitMQService;
    }

    async getAll(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const coupons = await CouponService.getAll(pool);
            res.status(200).json({ coupons, message: "Coupons retrieved successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async create(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const newCouponId = await CouponService.create(pool, req.body, this.rabbitMQService);
            res.status(201).json({ id: newCouponId, message: "Coupon created successfully" });
        } catch (error) {
            console.error('Error creating coupon:', error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }


    async getById(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const coupon = await CouponService.getById(pool, req.params.id);
            if (!coupon) return res.status(404).json({ error: "Coupon not found" });
            res.status(200).json(coupon);
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async update(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const rows = await CouponService.update(pool, req.params.id, req.body);
            if (rows === 0) return res.status(404).json({ error: "Coupon not found" });
            res.status(200).json({ message: "Coupon updated successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async delete(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const rows = await CouponService.delete(pool, req.params.id);
            if (rows === 0) return res.status(404).json({ error: "Coupon not found" });
            res.status(200).json({ message: "Coupon deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async validateCoupon(req, res) {
        try {
            const { userId, roles } = getUserFromToken(req);

            const pool = req.app.get('dbPool');
            const {coupon_code, total_price} = req.body;
            const result = await CouponService.validate(pool,userId, coupon_code, total_price);
            console.log('Validation result:', result);
            if (!result.valid) return res.status(400).json({ error: result.reason });
            res.status(200).json({ message: "Coupon is valid", data: result });
        } catch (error) {
            console.error('Error validating coupon:', error);
            res.status(500).json({ error: "Internal Server Error"  });
        }
    }

    async applyCouponToOrder(req, res) {
        try {
            const pool = req.app.get('dbPool');
            const result = await CouponService.applyToOrder(pool, req.body);
            if (!result.success) return res.status(400).json({ error: result.reason });
            res.status(200).json({ message: "Coupon applied to order successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = CouponController;
