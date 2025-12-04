const { poolConnect, pool, sql } = require("../database/connection");

class PaymentModel {
  static async create(data) {
    await poolConnect;

    const query = `
      INSERT INTO Payments 
      (order_id, provider, provider_order_id, amount, converted_amount, currency, payment_url, callback_data, status)
      VALUES 
      (@orderId, @provider, @providerOrderId, @amount, @convertedAmount, @currency, @paymentUrl, @callbackData, @status)
    `;

    return pool
      .request()
      .input("orderId", sql.Int, data.orderId)
      .input("provider", sql.NVarChar, data.provider)
      .input("providerOrderId", sql.NVarChar, data.providerOrderId || null)
      .input("amount", sql.Decimal(18, 2), data.amount)
      .input(
        "convertedAmount",
        sql.Decimal(18, 2),
        data.convertedAmount || null
      )
      .input("currency", sql.NVarChar, data.currency)
      .input("paymentUrl", sql.NVarChar, data.paymentUrl || null)
      .input("callbackData", sql.NVarChar, data.callbackData || null)
      .input("status", sql.NVarChar, data.status)
      .query(query);
  }

  static async updateStatusByProviderOrderId({
    providerOrderId,
    status,
    rawData,
  }) {
    await poolConnect;

    const query = `
      UPDATE Payments
      SET status = @status,
          callback_data = @callbackData,
          updated_at = GETDATE()
      WHERE provider_order_id = @providerOrderId
  `;
    console.log("Updating payment status:", { providerOrderId, status });
    return pool
      .request()
      .input("providerOrderId", sql.NVarChar, providerOrderId)
      .input("status", sql.NVarChar, status)
      .input("callbackData", sql.NVarChar, rawData)
      .query(query);
  }
  static async findByProviderOrderId(providerOrderId) {
    await poolConnect;

    const query = `
      SELECT * FROM Payments
      WHERE provider_order_id = @providerOrderId
    `;

    const result = await pool
      .request()
      .input("providerOrderId", sql.NVarChar, providerOrderId)
      .query(query);

    return result.recordset[0] || null;
  }
  static async findByProvider(provider) {
    await poolConnect;
    const query = `
    SELECT * FROM Payments
    WHERE provider = @Provider
    ORDER BY created_at DESC
  `;
    const result = await pool
      .request()
      .input("Provider", sql.NVarChar, provider)
      .query(query);
    return result.recordset;
  }
  static async findByOrderId(orderId) {
    await poolConnect;

    const query = `
    SELECT * FROM Payments
    WHERE order_id = @OrderId
  `;

    const result = await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .query(query);

    return result.recordset[0] || null;
  }
  static async getAll() {
    await poolConnect;
    const query = `SELECT * FROM Payments ORDER BY created_at DESC`;
    const result = await pool.request().query(query);
    return result.recordset;
  }
}

module.exports = PaymentModel;
