/** Chat API routes. */
import express from 'express';
import { ChatService } from '../services/chat.service.js';

const router = express.Router();


router.post('/send', async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({
        error: 'Missing required fields: user_id and message'
      });
    }

    const response = await ChatService.processMessage(user_id, message);

    return res.json({
      response: response
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /chat/change-flow
 * Chuyển sang flow khác (end current flow và start new flow)
 */
router.post('/change-flow', async (req, res) => {
  try {
    const { user_id, flow } = req.body;

    if (!user_id || !flow) {
      return res.status(400).json({
        error: 'Missing required fields: user_id and flow'
      });
    }

    const result = await ChatService.changeFlow(user_id, flow);

    return res.json(result);
  } catch (error) {
    console.error('Error changing flow:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;


