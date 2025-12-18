
export class FAQFlow {
  
  static async handle(userId, message, state) {
    const messageLower = message.toLowerCase();

    if (messageLower.includes("giá") || messageLower.includes("price")) {
      return [
        "Giá sản phẩm tùy thuộc vào loại sản phẩm. Bạn muốn biết giá của sản phẩm nào?",
        state
      ];
    }

    if (messageLower.includes("vận chuyển") || messageLower.includes("shipping")) {
      return [
        "Chúng tôi hỗ trợ giao hàng toàn quốc. Phí vận chuyển từ 30.000đ tùy theo địa chỉ.",
        state
      ];
    }

    if (messageLower.includes("trả hàng") || messageLower.includes("return")) {
      return [
        "Bạn có thể trả hàng trong vòng 7 ngày kể từ ngày nhận hàng. Vui lòng liên hệ hotline để được hỗ trợ.",
        state
      ];
    }
    return [
      "Xin chào! Tôi có thể giúp bạn với:\n- Thông tin sản phẩm\n- Đặt hàng\n- Vận chuyển\n- Trả hàng\n\nBạn cần hỗ trợ gì?",
      state
    ];
  }
}


