const sql = require("mssql");
const RabbitMQ = require("./RabbitMQService");
const redisService = require("./RedisService");
const Coupon = require("../Models/Coupon");
const OrderCoupon = require("../Models/OrderCoupon");

class CouponService {
  static async getAll(pool) {
    try {
      const result = await pool.request().query("SELECT * FROM Coupons");
      return result.recordset.map(
        (r) =>
          new Coupon(
            r.id,
            r.code,
            r.discount_type,
            r.discount_value,
            r.max_uses,
            r.expiry_date,
            r.occasion,
            r.min_price,
            r.created_at,
            r.updated_at
          )
      );
    } catch (err) {
      console.error("Error getting all coupons:", err);
      throw err;
    }
  }

  static async create(pool, couponData, rabbitMQ) {
    try {
      const existing = await pool
        .request()
        .input("code", sql.VarChar, couponData.code)
        .query("SELECT id FROM Coupons WHERE code = @code");

      if (existing.recordset.length > 0) {
        return {
          success: false,
          reason: `Coupon code '${couponData.code}' existed.`,
        };
      }

      const result = await pool
        .request()
        .input("code", sql.VarChar, couponData.code)
        .input("discount_type", sql.VarChar, couponData.discountType)
        .input("discount_value", sql.Decimal(10, 2), couponData.discountValue)
        .input("max_uses", sql.Int, couponData.maxUses)
        .input("expiry_date", sql.DateTime, couponData.expiryDate)
        .input("occasion", sql.VarChar, couponData.occasion)
        .input("min_price", sql.Decimal(10, 2), couponData.minPrice).query(`
                INSERT INTO Coupons (code, discount_type, discount_value, max_uses, expiry_date, occasion, min_price)
                VALUES (@code, @discount_type, @discount_value, @max_uses, @expiry_date, @occasion, @min_price);
                SELECT SCOPE_IDENTITY() AS id;
            `);

      const newCoupon = new Coupon(
        result.recordset[0].id,
        couponData.code,
        couponData.discountType,
        couponData.discountValue,
        couponData.maxUses,
        couponData.expiryDate,
        couponData.occasion,
        couponData.minPrice,
        new Date(),
        new Date()
      );

      if (rabbitMQ) {
        await rabbitMQ.publish("coupon_events", "coupon.created", newCoupon);
      }

      return { success: true, coupon: newCoupon };
    } catch (err) {
      console.error("Error creating coupon:", err);
      return { success: false, reason: err.message };
    }
  }

  static async getById(pool, id) {
    try {
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Coupons WHERE id = @id");
      if (!result.recordset[0]) return null;
      const r = result.recordset[0];
      return new Coupon(
        r.id,
        r.code,
        r.discount_type,
        r.discount_value,
        r.max_uses,
        r.expiry_date,
        r.occasion,
        r.min_price,
        r.created_at,
        r.updated_at
      );
    } catch (err) {
      console.error("Error getting coupon by id:", err);
      throw err;
    }
  }

  static async update(pool, id, data) {
    try {
      const existing = await pool
        .request()
        .input("code", sql.VarChar, couponData.code)
        .query("SELECT id FROM Coupons WHERE code = @code");

      if (existing.recordset.length > 0) {
        return {
          success: false,
          reason: `Coupon code '${couponData.code}' existed.`,
        };
      }

      await pool
        .request()
        .input("id", sql.Int, id)
        .input("code", sql.VarChar, data.code)
        .input("discount_type", sql.VarChar, data.discountType)
        .input("discount_value", sql.Decimal(10, 2), data.discountValue)
        .input("max_uses", sql.Int, data.maxUses)
        .input("expiry_date", sql.DateTime, data.expiryDate)
        .input("occasion", sql.VarChar, data.occasion)
        .input("min_price", sql.Decimal(10, 2), data.minPrice)
        .input("updated_at", sql.DateTime, new Date()).query(`
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

      return await CouponService.getById(pool, id);
    } catch (err) {
      console.error("Error updating coupon:", err);
      throw err;
    }
  }

  static async delete(pool, id) {
    try {
      const coupon = await CouponService.getById(pool, id);
      if (!coupon) return null;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Coupons WHERE id = @id");
      return result.rowsAffected[0] ? coupon : null;
    } catch (err) {
      console.error("Error deleting coupon:", err);
      throw err;
    }
  }

  static async validate(pool, user_id, coupon_code, total_price) {
    try {
      console.log(user_id,coupon_code,total_price)
      if (!user_id || !coupon_code || !total_price) {
        return {
          valid: false,
          reason: "Missing required data",
        };
      }

      const cached = await redisService.getObjectAsync(
        `coupon:validate:${user_id}:${coupon_code}`
      );
      if (cached) return cached;

      const result = await pool
        .request()
        .input("code", sql.VarChar, coupon_code)
        .query(`SELECT * FROM Coupons WHERE code = @code`);

      const couponRecord = result.recordset[0];
      if (!couponRecord) return { success: false, reason: "Coupon not found" };

      const coupon = new Coupon(
        couponRecord.id,
        couponRecord.code,
        couponRecord.discount_type,
        couponRecord.discount_value,
        couponRecord.max_uses,
        couponRecord.expiry_date,
        couponRecord.occasion,
        couponRecord.min_price,
        couponRecord.created_at,
        couponRecord.updated_at
      );

      const check = await pool
        .request()
        .input("coupon_id", sql.Int, coupon.id)
        .input("user_id", sql.Int, user_id)
        .query(
          `SELECT * FROM OrderCoupons WHERE coupon_id = @coupon_id AND user_id = @user_id`
        );

      if (check.recordset.length > 0)
        return { success: false, reason: "User has already used this coupon" };

      const now = new Date();
      if (coupon.expiryDate && coupon.expiryDate < now)
        return { success: false, reason: "Coupon has expired" };
      if (coupon.maxUses !== null && coupon.maxUses <= 0)
        return { success: false, reason: "Coupon usage limit reached" };
      if (coupon.minPrice !== null && total_price < coupon.minPrice)
        return {
          success: false,
          reason: `Order total must be at least ${coupon.minPrice}`,
        };

      const response = {
        valid: true,
        coupon_id: coupon.id,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        min_price: coupon.minPrice,
      };

      await redisService.setObjectAsync(
        `coupon:validate:${coupon_code}`,
        response,
        600
      );
      return response;
    } catch (err) {
      console.error("Error validating coupon:", err);
      throw err;
    }
  }

  static async applyToOrder(pool, { coupon_id, order_id, user_id }) {
    try {
      const check = await pool
        .request()
        .input("coupon_id", sql.Int, coupon_id)
        .input("user_id", sql.Int, user_id)
        .query(
          `SELECT * FROM OrderCoupons WHERE coupon_id = @coupon_id AND user_id = @user_id`
        );

      if (check.recordset.length > 0)
        return { success: false, reason: "User has already used this coupon" };

      const update = await pool
        .request()
        .input("coupon_id", sql.Int, coupon_id)
        .query(
          `UPDATE Coupons SET max_uses = max_uses - 1 WHERE id = @coupon_id AND max_uses > 0`
        );

      if (update.rowsAffected[0] === 0)
        return {
          success: false,
          reason:
            "Coupon cannot be applied. It may have expired or reached its usage limit.",
        };

      const orderCoupon = new OrderCoupon(order_id, coupon_id, new Date());

      await pool
        .request()
        .input("coupon_id", sql.Int, coupon_id)
        .input("order_id", sql.Int, order_id)
        .input("user_id", sql.Int, user_id)
        .query(
          `INSERT INTO OrderCoupons (order_id, coupon_id, user_id) VALUES (@order_id, @coupon_id, @user_id)`
        );

      return { success: true, orderCoupon };
    } catch (err) {
      console.error("Error applying coupon to order:", err);
      throw err;
    }
  }
}

module.exports = CouponService;
