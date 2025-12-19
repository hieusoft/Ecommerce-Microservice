import { AIService } from './ai.service.js';
import { StateService } from './state.service.js';
import { ConversationRepository } from '../repositories/conversation.repo.js';
import { ChatMessageRepository } from '../repositories/chatMessage.repo.js';
import { PlaceOrderFlow } from '../flows/placeOrder.flow.js';
import { FAQFlow } from '../flows/faq.flow.js';
import { GreetingFlow } from '../flows/greeting.flow.js';
import { PLACE_ORDER, FAQ, GREETING } from '../constants/flows.js';

export class ChatService {

  static async processMessage(userId, message) {
    console.log("=== ChatService.processMessage ===");
    console.log("userId:", userId);
    console.log("message:", message);

   
    let state = await StateService.getState(userId);
    let flow = state?.flow || null;

    console.log("Initial state:", state);
    console.log("Initial flow:", flow);

 
    const nlu = await AIService.detectIntent(message, {
      flow: state?.flow,
      step: state?.step,
      data: state?.data
    });
    console.log("NLU:", nlu);

   
    if (nlu.intent === "START_ORDER") {
      if (flow !== PLACE_ORDER) {
        flow = PLACE_ORDER;
        await StateService.setState(userId, flow, "ASK_OCCASION", {});
        console.log("Flow set/switched to PLACE_ORDER");
      } else {
        console.log("Already in PLACE_ORDER");
      }
    }

   
    else if (nlu.intent === "GREETING" && flow !== PLACE_ORDER) {
      flow = GREETING;
      await StateService.setState(userId, flow, null, {});
      console.log("Flow set/switched to GREETING");
    }

    else if (nlu.intent === "FAQ" && flow !== PLACE_ORDER) {
      flow = FAQ;
      await StateService.setState(userId, flow, null, {});
      console.log("Flow set/switched to FAQ");
    }

   
    else {
      console.log("Flow remains:", flow);
    }

    console.log("Selected flow:", flow);


    state = await StateService.getState(userId);
    console.log("Updated state:", state);


    let conversation = await ConversationRepository.getByUserId(userId);

    if (!conversation) {
      conversation = await ConversationRepository.create(userId, flow);
      console.log("Created new conversation:", conversation);
    } else if (conversation.current_flow !== flow) {
      conversation = await ConversationRepository.updateFlow(conversation.id, flow);
      console.log("Updated conversation flow:", conversation);
    } else {
      console.log("Existing conversation:", conversation);
    }

    const conversationId = conversation.id;
    console.log("conversationId:", conversationId);

    await ChatMessageRepository.create({
      conversationId,
      sender: "USER",
      message
    });

 
    let response;
    console.log("Dispatching to flow:", flow);

    try {
      switch (flow) {
        case PLACE_ORDER:
          console.log("Calling PlaceOrderFlow.handle");
          [response] = await PlaceOrderFlow.handle(userId, nlu, state, message);
          break;

        case GREETING:
          console.log("Calling GreetingFlow.handle");
          [response] = await GreetingFlow.handle(userId, message, state);
          break;

        case FAQ:
        default:
          console.log("Calling FAQFlow.handle");
          [response] = await FAQFlow.handle(userId, message, state);
          break;
      }
    } catch (err) {
      console.error("❌ Error in flow handle:", err);
      response = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn.";
    }

    if (!response) {
      console.error("❌ Response is NULL/UNDEFINED", { flow, nlu, state });
      response = "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn.";
    }

    console.log("Flow response:", response);

    await ChatMessageRepository.create({
      conversationId,
      sender: "ASSISTANT",
      message: response
    });

    console.log("=== End ChatService.processMessage ===");
    return response;
  }

  static async getMessage(userId) {
    const conversation = await ConversationRepository.getByUserId(userId);

    if (!conversation) {
      return null;
    }

    const messages = await ChatMessageRepository.getByConversation(
      conversation.id
    );

    return {
      conversationId: conversation.id,
      messages
    };
  }
}
