# Dockerfile cho PaymentService (Node.js)

# 1️⃣ Chọn base image Node.js LTS
FROM node:20-alpine

# 2️⃣ Thiết lập thư mục làm việc
WORKDIR /app

# 3️⃣ Copy package.json và package-lock.json trước để cache layer npm install
COPY package*.json ./

# 4️⃣ Cài dependencies
RUN npm install --production


COPY . .

ENV PORT=8084


EXPOSE 8084

# 8️⃣ Command chạy app
CMD ["node", "index.js"]
