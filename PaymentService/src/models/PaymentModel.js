const { poolConnect, pool, sql } = require("../database/connection");

class PaymentModel {
  static async create(data) {
    await poolConnect;

    const query = `
    INSERT INTO Payments 
    (order_id, user_id, provider, provider_order_id, amount, converted_amount, currency, payment_url, callback_data, status, expires_at)
    VALUES 
    (@orderId, @userId, @provider, @providerOrderId, @amount, @convertedAmount, @currency, @paymentUrl, @callbackData, @status, @expiresAt)
  `;

    return pool
      .request()
      .input("orderId", sql.Int, data.orderId)
      .input("userId", sql.Int, data.userId)
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
      .input("expiresAt", sql.DateTime, data.expiresAt || null)
      .query(query);
  }

  static async updateStatusByProviderOrderId({
    providerOrderId,
    status,
    callbackData,
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
      .input("callbackData", sql.NVarChar, callbackData)
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
        SELECT TOP 1 *
        FROM Payments
        WHERE order_id = @OrderId
        ORDER BY created_at DESC
    `;

    const result = await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .query(query);

    return result.recordset[0] || null;
  }

  static async getAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      provider,
      orderId,
      minAmount,
      maxAmount,
      currency,
      startDate,
      endDate,
      expired,
      sort,
      order,
    } = filters;

    await poolConnect;

    const params = [];
    let whereClause = "WHERE 1=1";

    if (status) {
      whereClause += " AND status=@status";
      params.push({ name: "status", type: sql.NVarChar, value: status });
    }
    if (provider) {
      whereClause += " AND provider=@provider";
      params.push({ name: "provider", type: sql.NVarChar, value: provider });
    }
    if (orderId) {
      whereClause += " AND order_id=@orderId";
      params.push({ name: "orderId", type: sql.Int, value: parseInt(orderId) });
    }
    if (minAmount) {
      whereClause += " AND amount>=@minAmount";
      params.push({
        name: "minAmount",
        type: sql.Decimal(18, 2),
        value: minAmount,
      });
    }
    if (maxAmount) {
      whereClause += " AND amount<=@maxAmount";
      params.push({
        name: "maxAmount",
        type: sql.Decimal(18, 2),
        value: maxAmount,
      });
    }
    if (currency) {
      whereClause += " AND currency=@currency";
      params.push({ name: "currency", type: sql.NVarChar, value: currency });
    }
    if (startDate) {
      whereClause += " AND created_at>=@startDate";
      params.push({
        name: "startDate",
        type: sql.DateTime,
        value: new Date(startDate),
      });
    }
    if (endDate) {
      whereClause += " AND created_at<=@endDate";
      params.push({
        name: "endDate",
        type: sql.DateTime,
        value: new Date(endDate),
      });
    }
    if (expired === "true") {
      whereClause += " AND expires_at IS NOT NULL AND expires_at<GETDATE()";
    }
    if (expired === "false") {
      whereClause += " AND expires_at IS NOT NULL AND expires_at>=GETDATE()";
    }

    const countRequest = pool.request();
    params.forEach((p) => countRequest.input(p.name, p.type, p.value));
    const countResult = await countRequest.query(
      `SELECT COUNT(*) AS total FROM Payments ${whereClause}`
    );
    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Query dữ liệu chính
    const offset = (page - 1) * limit;
    const sortField = [
      "payment_id",
      "created_at",
      "amount",
      "status",
      "provider",
    ].includes(sort)
      ? sort
      : "created_at";
    const sortOrder =
      (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    let query = `SELECT * FROM Payments ${whereClause} ORDER BY ${sortField} ${sortOrder} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    const request = pool.request();
    params.forEach((p) => request.input(p.name, p.type, p.value));
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);
    const result = await request.query(query);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      data: result.recordset,
    };
  }
}

module.exports = PaymentModel;
