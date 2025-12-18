import { PLACE_ORDER, FAQ } from '../constants/flows.js';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { config } from '../core/config.js';

const client = new BedrockRuntimeClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
  },
});

export class AIService {

 
  static async detectFlow(message) {
    const prompt = `Bạn là một trợ lý chatbot. Xác định xem người dùng đang muốn "PLACE_ORDER" hay "FAQ" dựa trên nội dung sau:
"${message}"
Chỉ trả về "PLACE_ORDER" hoặc "FAQ".`;

    try {
      // Sử dụng Claude API format
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const command = new InvokeModelCommand({
        modelId: config.AWS_BEDROCK_CLAUDE_ARN,
        contentType: "application/json",
        accept: "application/json",
        body: Buffer.from(body)
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(Buffer.from(response.body).toString());
      
     
      const resultText = responseBody.content?.[0]?.text || "";
      const flowText = resultText.trim().toUpperCase();
      
      if (flowText.includes("PLACE_ORDER")) {
        return PLACE_ORDER;
      }
      return FAQ;
    } catch (err) {
      console.error("Error calling AWS Bedrock/Claude:", err);
      // Fallback: sử dụng keyword detection
      const messageLower = message.toLowerCase();
      const orderKeywords = ["đặt hàng", "mua", "order", "place order", "thêm vào giỏ"];
      if (orderKeywords.some(keyword => messageLower.includes(keyword))) {
        return PLACE_ORDER;
      }
      return FAQ;
    }
  }

  static async generateResponse(message, flow, context = {}) {
    if (flow === PLACE_ORDER) {
      return "Bạn muốn đặt hàng gì? Vui lòng cho tôi biết tên sản phẩm.";
    }
    return "Xin chào! Tôi có thể giúp gì cho bạn? Bạn có thể hỏi về sản phẩm, đơn hàng, hoặc đặt hàng.";
  }

  
  static async shouldEndCurrentFlow(message, currentFlow, currentStep) {
    // Nếu không có flow hiện tại, không cần check
    if (!currentFlow) {
      return true;
    }

    // Nếu flow đã kết thúc (step = "confirm" hoặc không có step), cho phép chuyển flow
    if (!currentStep || currentStep === "confirm") {
      return true;
    }

    // Sử dụng AI để detect xem user có muốn kết thúc flow hiện tại không
    const prompt = `Bạn là một trợ lý chatbot. Người dùng đang trong flow "${currentFlow}" ở bước "${currentStep}".

Tin nhắn của người dùng: "${message}"

Hãy xác định xem người dùng có muốn KẾT THÚC flow hiện tại và chuyển sang chủ đề khác không, hay họ đang TRẢ LỜI câu hỏi trong flow hiện tại.

Chỉ trả về "YES" nếu người dùng muốn kết thúc flow hiện tại và chuyển sang chủ đề khác.
Trả về "NO" nếu người dùng đang trả lời câu hỏi trong flow hiện tại.

Ví dụ:
- "Tôi muốn hỏi về giá" → YES (muốn chuyển sang FAQ)
- "Tôi muốn đặt hàng" → YES (muốn chuyển sang PLACE_ORDER)
- "Sinh nhật" → NO (đang trả lời câu hỏi về dịp)
- "2 bó" → NO (đang trả lời về số lượng)
- "123 ABC" → NO (đang trả lời về địa chỉ)

Chỉ trả về "YES" hoặc "NO".`;

    try {
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const command = new InvokeModelCommand({
        modelId: config.AWS_BEDROCK_CLAUDE_ARN,
        contentType: "application/json",
        accept: "application/json",
        body: Buffer.from(body)
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(Buffer.from(response.body).toString());
      const resultText = responseBody.content?.[0]?.text || "";
      const shouldEnd = resultText.trim().toUpperCase().includes("YES");
      
      console.log(`AI detected shouldEndCurrentFlow: ${shouldEnd} for message: "${message}"`);
      return shouldEnd;
    } catch (err) {
      console.error("Error calling AI to detect flow end:", err);
      // Fallback: chỉ cho phép chuyển nếu có keyword rõ ràng
      const messageLower = message.toLowerCase();
      const endKeywords = ["hủy", "cancel", "thôi", "không", "dừng", "stop", "tôi muốn hỏi", "tôi muốn đặt"];
      return endKeywords.some(keyword => messageLower.includes(keyword));
    }
  }

  static shouldChangeFlow(message, currentFlow, detectedFlow) {
    if (!currentFlow) return true;
    if (detectedFlow === currentFlow) return false;

    if (currentFlow === PLACE_ORDER && detectedFlow === FAQ) {
      const messageLower = message.toLowerCase();
      const faqKeywords = ["giá", "price", "vận chuyển", "shipping", "trả hàng", "return", "hỏi", "thông tin"];
      return faqKeywords.some(keyword => messageLower.includes(keyword));
    }

    if (currentFlow === FAQ && detectedFlow === PLACE_ORDER) return true;

    return false;
  }
}
