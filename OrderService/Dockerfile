# Sử dụng image Node.js chính thức
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production


COPY . .


EXPOSE 8083

# Lệnh chạy service
CMD ["node", "index.js"]
