# 1. Chọn base image Node.js
FROM node:20-alpine

# 2. Thiết lập working directory trong container
WORKDIR /usr/src/app

# 3. Copy package.json và package-lock.json trước (tận dụng cache)
COPY package*.json ./

# 4. Cài dependencies
RUN npm install --production

# 5. Copy toàn bộ source code vào container
COPY . .

# 6. Expose port mà service Node.js sẽ chạy
EXPOSE 8080

# 7. Chạy app
CMD ["node", "index.js"]
