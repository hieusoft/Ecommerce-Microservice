import { getDB, sql } from '../core/database.js';
import { CHAT_MESSAGES_TABLE, ChatMessageColumns } from '../models/chatMessage.model.js';

export class ChatMessageRepository {
  
  static async create({ conversationId, sender, message, flow = null, state = null }) {
    if (!conversationId) throw new Error('conversationId is required');

    const pool = await getDB();
    const result = await pool
      .request()
      .input('conversation_id', sql.NVarChar(64), conversationId)
      .input('sender', sql.NVarChar(10), sender)
      .input('message', sql.NVarChar(sql.MAX), message)
      .input('flow', sql.NVarChar(30), flow)
      .input('state', sql.NVarChar(30), state)
      .query(`
        INSERT INTO ${CHAT_MESSAGES_TABLE} (
          ${ChatMessageColumns.CONVERSATION_ID},
          ${ChatMessageColumns.SENDER},
          ${ChatMessageColumns.MESSAGE},
          ${ChatMessageColumns.FLOW},
          ${ChatMessageColumns.STATE}
        )
        OUTPUT INSERTED.*
        VALUES (@conversation_id, @sender, @message, @flow, @state);
      `);

    return result.recordset[0];
  }

  
  static async getByConversation(conversationId) {
  if (!conversationId) throw new Error('conversationId is required');

  const pool = await getDB();
  const result = await pool
    .request()
    .input('conversation_id', sql.NVarChar(64), conversationId)
    .query(`
      SELECT TOP 15 *
      FROM ${CHAT_MESSAGES_TABLE}
      WHERE ${ChatMessageColumns.CONVERSATION_ID} = @conversation_id
      ORDER BY ${ChatMessageColumns.CREATED_AT} ASC;
    `);

  return result.recordset;
}

}
