import { AIService } from '../services/ai.service.js';
import OpenAI from "openai";
import { config } from "../core/config.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPENROUTER_API_KEY,
});

const MODEL_ID = "xiaomi/mimo-v2-flash:free";

export class GreetingFlow {
  static async handle(userId, message, state) {
    try {
    
      const prompt = `
Bạn là trợ lý chatbot thân thiện cho cửa hàng hoa. Người dùng vừa gửi một lời chào hoặc yêu cầu tạo lời chúc.

Tin nhắn người dùng: "${message}"

Nhiệm vụ:
- Nếu là lời chào (xin chào, hello, hi, chào bạn, etc.), hãy chào lại một cách thân thiện và hỏi xem bạn có thể giúp gì (ví dụ: đặt hoa, tạo lời chúc, tư vấn)
- Nếu người dùng yêu cầu tạo lời chúc (ví dụ: "tạo lời chúc sinh nhật", "viết lời chúc kỷ niệm", "lời chúc cho ngày 8/3", "lời chúc valentine", etc.), hãy tạo một lời chúc phù hợp, ngắn gọn, ấm áp (khoảng 2-3 câu)
- Lời chúc phải bằng tiếng Việt, tự nhiên, chân thành, phù hợp với dịp được đề cập
- Nếu không rõ mục đích, hãy hỏi lại người dùng muốn tạo lời chúc cho dịp gì

Trả về CHỈ câu trả lời, không cần format JSON hay ký tự đặc biệt.
`;

      const res = await openai.chat.completions.create({
        model: MODEL_ID,
        messages: [{ role: "user", content: prompt }],
      });

      const response = res.choices[0].message.content.trim();
      return [response, state];
    } catch (error) {
      console.error("Error generating greeting:", error);
      return [
        "Xin chào! Tôi có thể giúp bạn tạo lời chúc cho các dịp đặc biệt. Bạn muốn tạo lời chúc cho dịp gì?",
        state
      ];
    }
  }
}

