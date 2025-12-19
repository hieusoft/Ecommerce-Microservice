import { AIService } from '../services/ai.service.js';

export class FAQFlow {

  static async handle(userId, message, state) {
    const messageLower = message.toLowerCase();

    const keywords = {
      price: ["giá", "price", "chi phí"],
      shipping: ["vận chuyển", "shipping", "giao hàng"],
      return: ["trả hàng", "return", "hoàn trả"]
    };
    for (const [type, keys] of Object.entries(keywords)) {
      if (keys.some(k => messageLower.includes(k))) {
        switch (type) {
          case "price":
            return [
              "Giá sản phẩm tùy thuộc vào loại sản phẩm. Bạn muốn biết giá của sản phẩm nào?",
              state
            ];
          case "shipping":
            return [
              "Chúng tôi hỗ trợ giao hàng toàn quốc. Phí vận chuyển từ 30.000đ tùy theo địa chỉ.",
              state
            ];
          case "return":
            return [
              "Bạn có thể trả hàng trong vòng 7 ngày kể từ ngày nhận hàng. Vui lòng liên hệ hotline để được hỗ trợ.",
              state
            ];
        }
      }
    }

    // Nếu không khớp keyword, sử dụng AI để trả lời FAQ
    try {
      const response = await AIService.generateResponse(message, "FAQ", state);
      return [response, state];
    } catch (err) {
      console.error("Error generating FAQ response:", err);
      return [
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không?",
        state
      ];
    }
  }
}
