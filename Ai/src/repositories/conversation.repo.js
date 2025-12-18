import { getDB, sql } from "../core/database.js";
import { CONVERSATIONS_TABLE, ConversationColumns } from "../models/conversation.model.js";
import { v4 as uuidv4 } from 'uuid';

export class ConversationRepository {
  /**
   * Lấy conversation mới nhất của user
   */
  static async getByUserId(userId) {
    const pool = await getDB();
    const result = await pool
      .request()
      .input("user_id", sql.NVarChar(64), userId)
      .query(`
        SELECT TOP 1 *
        FROM ${CONVERSATIONS_TABLE}
        WHERE ${ConversationColumns.USER_ID} = @user_id
        ORDER BY ${ConversationColumns.STARTED} DESC
      `);

    return result.recordset[0] || null;
  }

  /**
   * Tạo conversation mới
   */
  static async create(userId, flow = null) {
    const pool = await getDB();
    const conversationId = uuidv4(); // sinh id mới
    const result = await pool
      .request()
      .input("id", sql.NVarChar(64), conversationId)
      .input("user_id", sql.NVarChar(64), userId)
      .input("current_flow", sql.NVarChar(30), flow)
      .query(`
        INSERT INTO ${CONVERSATIONS_TABLE} 
          (${ConversationColumns.ID}, ${ConversationColumns.USER_ID}, ${ConversationColumns.CURRENT_FLOW})
        OUTPUT INSERTED.*
        VALUES (@id, @user_id, @current_flow);
      `);

    return result.recordset[0];
  }


  static async updateFlow(conversationId, flow) {
    const pool = await getDB();
    const result = await pool
      .request()
      .input("id", sql.NVarChar(64), conversationId)
      .input("current_flow", sql.NVarChar(30), flow)
      .query(`
        UPDATE ${CONVERSATIONS_TABLE}
        SET ${ConversationColumns.CURRENT_FLOW} = @current_flow
        OUTPUT INSERTED.*
        WHERE ${ConversationColumns.ID} = @id;
      `);

    return result.recordset[0] || null;
  }
}
