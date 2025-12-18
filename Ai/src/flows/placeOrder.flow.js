import { StateService } from '../services/state.service.js';
import { ApiService } from '../services/api.service.js';

export class PlaceOrderFlow {
  static STEPS = {
    ask_ocassion: "Bạn muốn mua hoa cho dịp nào? Chúng tôi có các dịp sau:",
    ask_suboccasion: "Dựa theo dịp đó, bạn có thể chọn loại bó hoa sau:",
    ask_bouquet: "Bạn chọn bó hoa nào?",
    ask_color: "Bạn muốn màu sắc nào cho bó hoa?",
    ask_quantity: "Bạn muốn bao nhiêu bó?",
    ask_recipient: "Vui lòng cho tôi biết tên người nhận và số điện thoại.",
    ask_address: "Vui lòng cho tôi biết địa chỉ giao hàng.",
    ask_note: "Bạn có muốn gửi kèm lời nhắn không?",
    confirm: "Cảm ơn bạn! Đơn hàng của bạn đã được ghi nhận."
  };

  static async handle(userId, message, state) {
    const step = state.step || "ask_ocassion";
    const data = state.data || {};

    switch (step) {
      case "ask_ocassion": {
        const occasions = await ApiService.getOccasions();
        await StateService.setState(userId, "PLACE_ORDER", "ask_suboccasion", data);
        return [
          `${PlaceOrderFlow.STEPS.ask_ocassion}\n${occasions.map(o => `- ${o.name}`).join("\n")}`,
          { step: "ask_suboccasion", data, occasions }
        ];
      }

      case "ask_suboccasion": {
        const occasions = await ApiService.getOccasions();
        
        const selectedOccasion = occasions.find(o => o.name.toLowerCase() === message.toLowerCase());
        if (!selectedOccasion) {
          return [`Xin lỗi, chúng tôi không có dịp đó. Vui lòng chọn lại:\n${occasions.map(o => `- ${o.name}`).join("\n")}`,
                  { step: "ask_suboccasion", data, occasions }];
        }

        data.ocassion = selectedOccasion.name;
        const subOccasions = selectedOccasion.subOccasions || [];
        await StateService.setState(userId, "PLACE_ORDER", "ask_bouquet", data);
        return [
          `${PlaceOrderFlow.STEPS.ask_suboccasion}\n${subOccasions.map(s => `- ${s.name}`).join("\n")}`,
          { step: "ask_bouquet", data, subOccasions }
        ];
      }

    
    case "ask_bouquet": {
      data.suboccasion = message; 
      const bouquets = await ApiService.getBouquets(data.suboccasion); 
      await StateService.setState(userId, "PLACE_ORDER", "ask_color", data);
      
      return [
        `${PlaceOrderFlow.STEPS.ask_bouquet}\n${bouquets.map(b => `- ${b.name}`).join("\n")}`,
        { step: "ask_color", data }
      ];
    }
      default:
        await StateService.setState(userId, "PLACE_ORDER", "ask_ocassion", {});
        return [PlaceOrderFlow.STEPS.ask_ocassion, { step: "ask_ocassion", data: {} }];
    }
  }
}
