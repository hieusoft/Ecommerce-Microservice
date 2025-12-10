# Dùng Node.js chính thức
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước (tận dụng cache)
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy toàn bộ source code vào container
COPY . .

# Expose port service
EXPOSE 8086

# Chạy app
CMD ["node", "index.js"]
