# Chatbot Service

Hệ thống chatbot đơn giản với quản lý flow và state (Node.js/Express).

## Cấu trúc

```
chatbot-service/
├── src/
│   ├── app.js                    # App entry
│   ├── api/
│   │   └── chat.route.js        # POST /chat/send
│   ├── core/
│   │   ├── config.js            # Environment configuration
│   │   ├── redis.js             # Redis (context)
│   │   └── database.js          # SQL Server (history)
│   ├── models/
│   │   ├── conversation.model.js
│   │   └── chatMessage.model.js
│   ├── repositories/
│   │   ├── conversation.repo.js
│   │   └── chatMessage.repo.js
│   ├── services/
│   │   ├── ai.service.js        # AI: determine flow
│   │   ├── state.service.js     # Redis: flow + step
│   │   └── chat.service.js      # Orchestrator
│   ├── flows/
│   │   ├── placeOrder.flow.js   # Handle PLACE_ORDER
│   │   └── faq.flow.js          # Handle FAQ
│   └── constants/
│       └── flows.js             # PLACE_ORDER, FAQ
├── .env                          # Environment variables
├── package.json
└── README.md
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình môi trường:
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

3. Đảm bảo SQL Server và Redis đang chạy:
- SQL Server: `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- Redis: `localhost:6379`

4. Chạy ứng dụng:
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /chat/send

Gửi tin nhắn và nhận phản hồi từ chatbot.

**Request:**
```json
{
  "user_id": "user123",
  "message": "Tôi muốn đặt hàng"
}
```

**Response:**
```json
{
  "response": "Bạn muốn đặt hàng gì? Vui lòng cho tôi biết tên sản phẩm."
}
```

### POST /chat/change-flow

Chuyển sang flow khác (kết thúc flow hiện tại và bắt đầu flow mới).

**Request:**
```json
{
  "user_id": "user123",
  "flow": "FAQ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã chuyển sang flow: FAQ",
  "conversation_id": "uuid-here",
  "current_flow": "FAQ"
}
```

**Lưu ý:** Flow phải là một trong các giá trị hợp lệ: `PLACE_ORDER`, `FAQ`

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Flows

### PLACE_ORDER
Flow đặt hàng với các bước:
1. Hỏi tên sản phẩm
2. Hỏi số lượng
3. Hỏi địa chỉ
4. Xác nhận đơn hàng

### FAQ
Flow trả lời câu hỏi thường gặp về giá, vận chuyển, trả hàng.

## State Management

State được lưu trong Redis với key `context:{user_id}`:
- `flow`: Flow hiện tại (PLACE_ORDER, FAQ)
- `step`: Bước hiện tại trong flow
- `data`: Dữ liệu thu thập được

## Database

Lịch sử hội thoại và tin nhắn được lưu trong SQL Server:
- `conversations`: Bảng chứa thông tin hội thoại
- `chat_messages`: Bảng chứa lịch sử tin nhắn

**Lưu ý:** 
- Đảm bảo SQL Server đang chạy và database/tables đã được tạo trước khi chạy ứng dụng
- Cấu hình kết nối trong `.env` (ví dụ):
  - `DB_SERVER=localhost`
  - `DB_PORT=1433`
  - `DB_NAME=ChatbotService`
  - `DB_USER=sa`
  - `DB_PASSWORD=YourStrong@Passw0rd`

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQL Server** - Database (dùng thư viện `mssql`)
- **Redis** - State management
- **dotenv** - Environment variables

## Scripts

- `npm start` - Chạy ứng dụng
- `npm run dev` - Chạy ứng dụng ở chế độ development (với nodemon)
