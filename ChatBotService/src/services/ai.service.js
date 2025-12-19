import OpenAI from "openai";
import { config } from "../core/config.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPENROUTER_API_KEY,
});

const MODEL_ID = "mistralai/devstral-2512:free";

export class AIService {
  static async detectIntent(message, context = {}) {
    const prompt = `
Bạn là một bộ máy NLU cho chatbot cửa hàng hoa.

CHỈ trả về JSON với format: { "intent": "...", "entities": {...} }

CÁC INTENT VÀ KHI NÀO SỬ DỤNG:

1. START_ORDER: Khi người dùng:
   - Hỏi về sản phẩm/hoa có trong shop ("shop có hoa gì", "có những loại hoa nào", "show me flowers")
   - Muốn xem danh mục sản phẩm
   - Muốn đặt hàng, mua hoa ("tôi muốn mua hoa", "đặt hoa", "order flowers")
   - Bắt đầu quá trình mua hàng

2. SELECT_OCCASION: Khi người dùng chọn/chỉ định dịp (sinh nhật, kỷ niệm, v.v.)
   - Ví dụ: "sinh nhật", "birthday", "kỷ niệm"

3. SELECT_SUBOCCASION: Khi người dùng chọn phong cách hoa cụ thể
   - Ví dụ: "romantic", "elegant", "simple"

4. SELECT_BOUQUET: Khi người dùng chọn bó hoa cụ thể
   - Ví dụ: "bó hoa hồng đỏ", "bouquet number 5"

5. GREETING: Khi người dùng:
   - Chào hỏi ("xin chào", "hello", "hi", "chào bạn", "good morning", etc.)
   - Yêu cầu tạo lời chúc ("tạo lời chúc", "viết lời chúc", "lời chúc sinh nhật", "lời chúc kỷ niệm", etc.)
   - Hỏi về lời chúc cho các dịp đặc biệt

6. FAQ: Chỉ khi người dùng hỏi về:
   - Chính sách (giá cả, vận chuyển, đổi trả, thanh toán)
   - Dịch vụ (thời gian giao hàng, phí ship)
   - Thông tin shop (địa chỉ, giờ mở cửa, liên hệ)
   - KHÔNG phải câu hỏi về sản phẩm/hoa cụ thể

7. UNKNOWN: Khi không thể xác định rõ ràng

Trích xuất các entity nếu có (occasion, suboccasion, bouquet, v.v.)

Tin nhắn người dùng:
"${message}"

Ngữ cảnh:
${JSON.stringify(context)}

`;

    const res = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
    });

    let text = res.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    return JSON.parse(text);
  }

  static async generateResponse(message, flowType, state = {}) {
    const prompt = `
You are a helpful assistant for a flower shop chatbot.

User question: "${message}"
Flow type: ${flowType}
Context: ${JSON.stringify(state)}

Provide a helpful, friendly response in Vietnamese. Be concise and helpful.
`;

    const res = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content.trim();
  }

  static async processFlowStep(step, userMessage, context = {}) {
    const { occasions = [], subOccasions = [], bouquets = [], data = {} } = context;
    
    const prompt = `
Bạn là trợ lý chatbot cho cửa hàng hoa. Xử lý bước hiện tại trong flow đặt hàng.

Bước hiện tại: ${step}
Tin nhắn người dùng: "${userMessage}"
Dữ liệu đã có: ${JSON.stringify(data)}

Danh sách có sẵn:
- Occasions: ${JSON.stringify(occasions.map(o => ({ name: o.name, id: o.id })))}
- SubOccasions: ${JSON.stringify(subOccasions.map(s => ({ name: s.name || s.title, id: s._id || s.id })))}
- Bouquets: ${JSON.stringify(bouquets.map(b => ({ name: b.name || b.title, id: b.id || b._id, price: b.price })))}

CHỈ trả về JSON với format:
{
  "response": "Câu trả lời cho người dùng (tiếng Việt)",
  "selectedItem": { "type": "occasion|suboccasion|bouquet", "name": "...", "id": "..." } hoặc null,
  "nextStep": "ASK_OCCASION|ASK_SUBOCCASION|ASK_BOUQUET|DONE" hoặc giữ nguyên step hiện tại
}

QUY TẮC QUAN TRỌNG:

1. MATCHING LINH HOẠT:
   - Phân tích tin nhắn người dùng một cách thông minh, không chỉ dựa vào exact match
   - Ví dụ: "love", "romance", "tình yêu", "lãng mạn" đều có thể match với "Love & Romance"
   - "hoa hồng", "roses", "rose" có thể match với "Roses" hoặc "Red Roses"
   - "pink romance" có thể match với "Pink Romance"
   - Bỏ qua các từ không quan trọng như "đi", "nhé", "ạ", "với", "cho"
   - Không phân biệt hoa thường/hoa thường: "Love" = "love" = "LOVE"
   - Không phân biệt ký tự đặc biệt: "Love & Romance" = "Love and Romance" = "Love Romance"

2. MATCHING THEO TỪ KHÓA:
   - Nếu tin nhắn chứa một phần tên item, coi như match
   - Ví dụ: "love" match với "Love & Romance", "romance" cũng match với "Love & Romance"
   - Nếu có nhiều item khớp, chọn item có độ tương đồng cao nhất

3. MATCHING ĐA NGÔN NGỮ:
   - Hiểu cả tiếng Anh và tiếng Việt
   - Ví dụ: "tình yêu" = "love", "lãng mạn" = "romance", "sinh nhật" = "birthday"
   - "hoa" = "flower", "hoa hồng" = "rose", "kỷ niệm" = "anniversary"

4. XỬ LÝ RESPONSE:
   - Nếu tìm thấy item: trả về selectedItem với name CHÍNH XÁC từ danh sách (không thay đổi)
   - Nếu không tìm thấy: yêu cầu chọn lại và hiển thị danh sách đầy đủ với format: "1. Tên - Giá$" (nếu có giá)
   - Response phải thân thiện, bằng tiếng Việt
   - Khi hiển thị danh sách, format rõ ràng, dễ đọc

5. CHUYỂN BƯỚC:
   - Nếu đã chọn occasion → nextStep = "ASK_SUBOCCASION"
   - Nếu đã chọn suboccasion → nextStep = "ASK_BOUQUET"
   - Nếu đã chọn bouquet → nextStep = "DONE"
   - Nếu chưa chọn được → giữ nguyên step hiện tại
`;

    const res = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
    });

    let text = res.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    return JSON.parse(text);
  }
}
