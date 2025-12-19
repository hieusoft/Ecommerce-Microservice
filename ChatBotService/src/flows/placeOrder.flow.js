import { StateService } from "../services/state.service.js";
import { ApiService } from "../services/api.service.js";
import { AIService } from "../services/ai.service.js";
import { config } from "../core/config.js";
export class PlaceOrderFlow {
  static async handle(userId, nlu, state, userMessage = "") {
    const step = state.step ?? "ASK_OCCASION";
    const data = state.data ?? {};

    try {
      let occasions = [];
      let subOccasions = [];
      let bouquets = state.bouquets || [];

      if (step === "ASK_OCCASION") {
        occasions = await ApiService.getOccasions();
        console.log("Fetched occasions:", occasions);
      } else if (step === "ASK_SUBOCCASION") {
        subOccasions = state.subOccasions || [];

        if (!subOccasions.length && data.occasion) {
          const occasion = await ApiService.getOccasionByName(data.occasion);
          if (occasion.subOccasions && Array.isArray(occasion.subOccasions)) {
            subOccasions = occasion.subOccasions;
          }
        }
      } else if (step === "ASK_BOUQUET") {
        bouquets = state.bouquets || [];
        if (!bouquets.length && data.suboccasion) {
          bouquets = await ApiService.getBouquets(data.suboccasion);
        }
      }

      const aiResult = await AIService.processFlowStep(step, userMessage, {
        occasions,
        subOccasions,
        bouquets: Array.isArray(bouquets) ? bouquets : (bouquets.data || []),
        data
      });

      console.log("AI result:", aiResult);



      if (aiResult.selectedItem) {
        const { type, name, id } = aiResult.selectedItem;
        

        if (type === "occasion") {
          data.occasion = name;
          const nextStep = aiResult.nextStep || "ASK_SUBOCCASION";
          await StateService.setState(userId, "PLACE_ORDER", nextStep, data);
          
          
          if (nextStep === "ASK_SUBOCCASION") {
            const occasion = await ApiService.getOccasionByName(name);
            const subOccasions = occasion.subOccasions || [];
            return [aiResult.response, { step: nextStep, data, subOccasions }];
          }
        } else if (type === "suboccasion") {
          data.suboccasion = name;
          const nextStep = aiResult.nextStep || "ASK_BOUQUET";
          await StateService.setState(userId, "PLACE_ORDER", nextStep, data);
          
       
          if (nextStep === "ASK_BOUQUET") {
            const bouquets = await ApiService.getBouquets(name);
            return [aiResult.response, { step: nextStep, data, bouquets }];
          }
        } else if (type === "bouquet") {
          data.bouquet = name;
          data.bouquetId = id;
          
          
          const normalizeForUrl = (text) => {
            return text?.toLowerCase()
              .replace(/[&]/g, 'and')
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
          };
          
          const orderLink = `/${normalizeForUrl(data.occasion)}/${normalizeForUrl(data.suboccasion)}/${id}`;
          
          await StateService.clearState(userId);
          
          return [
            `${aiResult.response}\n\nLink đặt hàng: ${orderLink}`,
            { step: "DONE", data }
          ];
        }
      }

      return [aiResult.response, { ...state, occasions, subOccasions, bouquets }];

    } catch (error) {
      console.error("Error in PlaceOrderFlow:", error);
      return [
        "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        state
      ];
    }
  }
}
