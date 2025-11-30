const { poolConnect, pool, sql } = require("../database/connection");

class PaymentModel {
  static async create(data) {
    await poolConnect;
    console.log("Inserting payment record into database for order:", data.orderId);
    const query = `
      INSERT INTO Payments (order_id, provider, amount, currency, payment_url, status)
      VALUES (@orderId, @provider, @amount, @currency, @paymentUrl, @status)
    `;

    return pool.request()
      .input("orderId", sql.NVarChar, data.orderId)
      .input("provider", sql.NVarChar, data.provider)
      .input("amount", sql.Decimal(18,2), data.amount) // ⚡ thêm precision, scale
      .input("currency", sql.NVarChar, data.currency)
      .input("paymentUrl", sql.NVarChar, data.paymentUrl)
      .input("status", sql.NVarChar, data.status)
      .query(query);
  }
}

module.exports = PaymentModel;
