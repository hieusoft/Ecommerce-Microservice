
import express from 'express';
import { ChatService } from '../services/chat.service.js';
import  { getUserFromToken } from '../services/jwt.service.js';

const router = express.Router();
function getAuthUser(req, res) {
    try {
   
        return getUserFromToken(req); 
        
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
        return null;
    }
}

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
      message: error.message || error.toString() || 'Unknown error occurred'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const user = getAuthUser(req, res);
        if (!user) return;

    const { userId, roles } = user;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required query param: user_id'
      });
    }

    const messages = await ChatService.getConversation(user_id);

    return res.json({
      user_id,
      messages
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || error.toString() || 'Unknown error occurred'
    });
  }
});

export default router;



