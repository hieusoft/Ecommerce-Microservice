const sql = require('mssql');

class CouponService {
    static async getAll(pool) {
        const result = await pool.request().query('SELECT * FROM Coupons');
        return result.recordset;
    }

    static async create(pool, couponData, rabbitMQ) {
        const result = await pool.request()
            .input('code', sql.VarChar, couponData.code)
            .input('discount_type', sql.VarChar, couponData.discountType)
            .input('discount_value', sql.Decimal(10, 2), couponData.discountValue)
            .input('max_uses', sql.Int, couponData.maxUses)
            .input('expiry_date', sql.DateTime, couponData.expiryDate)
            .input('occasion', sql.VarChar, couponData.occasion)
            .input('min_price', sql.Decimal(10, 2), couponData.minPrice)
            .query(`
                INSERT INTO Coupons (code, discount_type, discount_value, max_uses, expiry_date, occasion, min_price)
                VALUES (@code, @discount_type, @discount_value, @max_uses, @expiry_date, @occasion, @min_price );
                SELECT SCOPE_IDENTITY() AS id;
            `);

        const newCouponId = result.recordset[0].id;

        if (rabbitMQ) {
            await rabbitMQ.publish('coupon_events', 'coupon.created', { id: newCouponId, ...couponData });
        }

        return newCouponId;
    }

    static async getById(pool, id) {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Coupons WHERE id = @id');
        return result.recordset[0] || null;
    }
    static async update(pool, id, data) {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('code', sql.VarChar, data.code)
            .input('discount_type', sql.VarChar, data.discountType)
            .input('discount_value', sql.Decimal(10, 2), data.discountValue)
            .input('max_uses', sql.Int, data.maxUses)
            .input('expiry_date', sql.DateTime, data.expiryDate)
            .input('occasion', sql.VarChar, data.occasion)
            .input('min_price', sql.Decimal(10, 2), data.minPrice)
            .input('updated_at', sql.DateTime, new Date())
            .query(`
            UPDATE Coupons 
            SET code = @code,
                discount_type = @discount_type,
                discount_value = @discount_value,
                max_uses = @max_uses,
                expiry_date = @expiry_date,
                occasion = @occasion,
                min_price = @min_price,
                updated_at = @updated_at
            WHERE id = @id

        `);

        return result.rowsAffected[0];
    }

    static async delete(pool, id) {
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Coupons WHERE id = @id');
        return result.rowsAffected[0];
    }

    static async validate(pool, coupon_code, total_price) {
        const result = await pool.request()
            .input('code', sql.VarChar, coupon_code)
            .query('SELECT * FROM Coupons WHERE code = @code');

        const coupon = result.recordset[0];
        if (!coupon) return { valid: false, reason: "Coupon not found" };

        const now = new Date();


        if (coupon.expiry_date && coupon.expiry_date < now)
            return { valid: false, reason: "Coupon has expired" };

        if (coupon.max_uses !== null && coupon.max_uses <= 0)
            return { valid: false, reason: "Coupon usage limit reached" };


        if (coupon.min_price !== null && total_price < coupon.min_price)
            return { valid: false, reason: `Order total must be at least ${coupon.min_price}` };

        return {
            valid: true,
            coupon_id: coupon.id,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_price: coupon.min_price
        };
    }



    static async applyToOrder(pool, { coupon_id, order_id, user_id }) {
        try {
            const check = await pool.request()
                .input('coupon_id', sql.Int, coupon_id)
                .input('user_id', sql.Int, user_id)
                .query(`
                SELECT * FROM OrderCoupons 
                WHERE coupon_id = @coupon_id AND user_id = @user_id
            `);

            if (check.recordset.length > 0) {
                return { success: false, reason: "User has already used this coupon" };
            }
            const update = await pool.request()
                .input('coupon_id', sql.Int, coupon_id)
                .query(`
                    UPDATE Coupons 
                    SET max_uses = max_uses - 1 
                    WHERE id = @coupon_id 
                    AND max_uses > 0

                    `);

            if (update.rowsAffected[0] === 0) {
                return { success: false, reason: "Coupon cannot be applied. It may have expired or reached its usage limit." };
            }

            const rs = await pool.request()
                .input('coupon_id', sql.Int, coupon_id)
                .input('order_id', sql.Int, order_id)
                .input('user_id', sql.Int, user_id)
                .query(`
                INSERT INTO OrderCoupons (order_id, coupon_id, user_id)
                VALUES (@order_id, @coupon_id, @user_id)
            `);

            return { success: true };
        } catch (err) {
            console.log("❌ SQL ERROR in applyToOrder:");
            console.log(err.originalError?.info?.message || err);
            throw err;
        }
    }

}

module.exports = CouponService;
