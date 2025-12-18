
import { AIService } from './ai.service.js';
import { StateService } from './state.service.js';
import { ConversationRepository } from '../repositories/conversation.repo.js';
import { ChatMessageRepository } from '../repositories/chatMessage.repo.js';
import { PlaceOrderFlow } from '../flows/placeOrder.flow.js';
import { FAQFlow } from '../flows/faq.flow.js';
import { PLACE_ORDER, FAQ, ALL_FLOWS } from '../constants/flows.js';

export class ChatService {
 
static async processMessage(userId, message) {
  const state = await StateService.getState(userId);
  
  let currentFlow = state.flow;
  const currentStep = state.step;
  
  // Chỉ detect flow mới khi:
  // 1. Không có flow hiện tại (flow đã kết thúc)
  // 2. Hoặc AI xác nhận user muốn kết thúc flow hiện tại
  const shouldEndCurrentFlow = await AIService.shouldEndCurrentFlow(message, currentFlow, currentStep);
  
  if (shouldEndCurrentFlow) {
    // User muốn kết thúc flow hiện tại, detect flow mới
    const detectedFlow = await AIService.detectFlow(message);
    console.log(`Flow end detected. Current: ${currentFlow}, Detected: ${detectedFlow}`);
    
    if (!currentFlow || detectedFlow !== currentFlow) {
      // Chuyển sang flow mới
      console.log(`Flow change: ${currentFlow} -> ${detectedFlow}`);
      await StateService.clearState(userId);
      currentFlow = detectedFlow;
      await StateService.setState(userId, currentFlow, null, {});
    }
  } else if (!currentFlow) {
    // Chưa có flow, detect flow mới
    const detectedFlow = await AIService.detectFlow(message);
    currentFlow = detectedFlow;
    await StateService.setState(userId, currentFlow);
  }
  
  // Nếu có flow hiện tại và không muốn kết thúc, tiếp tục flow hiện tại
  console.log(`Processing with flow: ${currentFlow}, step: ${currentStep}`);

  let conversation = await ConversationRepository.getByUserId(userId);
  if (!conversation) {
    conversation = await ConversationRepository.create(userId, currentFlow);
  } else if (conversation.current_flow !== currentFlow) {
    conversation = await ConversationRepository.updateFlow(conversation.id, currentFlow);
  }

  const conversationId = conversation.id;

  await ChatMessageRepository.create({
    conversationId,
    sender: "USER",
    message
  });


  let response;
  if (currentFlow === PLACE_ORDER) {
    [response] = await PlaceOrderFlow.handle(userId, message, state);
  } else if (currentFlow === FAQ) {
    [response] = await FAQFlow.handle(userId, message, state);
  } else {
    response = "Xin lỗi, tôi chưa hiểu. Bạn có thể nói rõ hơn không?";
  }

  await ChatMessageRepository.create({
    conversationId,
    sender: "ASSISTANT",
    message: response
  });

  return response;
}

  
  static async changeFlow(userId, newFlow) {
   
    if (!newFlow || !ALL_FLOWS.includes(newFlow)) {
      throw new Error(`Invalid flow: ${newFlow}. Valid flows: ${ALL_FLOWS.join(', ')}`);
    }
    
   
    await StateService.clearState(userId);
    
    
    await StateService.setState(userId, newFlow, null, {});
 
    let conversation = await ConversationRepository.getByUserId(userId);
    if (conversation) {
      conversation = await ConversationRepository.updateFlow(conversation.id, newFlow);
    } else {
      conversation = await ConversationRepository.create(userId, newFlow);
    }
    
    return {
      success: true,
      message: `Đã chuyển sang flow: ${newFlow}`,
      conversation_id: conversation.id,
      current_flow: newFlow
    };
  }

}

