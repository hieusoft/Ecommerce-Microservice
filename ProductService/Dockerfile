# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files for install dependencies
COPY package*.json ./

# 4. Install only production dependencies
RUN npm install --production

# 5. Copy toàn bộ service vào container
COPY . .

# 6. Expose port (trùng với PORT trong env hoặc docker-compose)
EXPOSE 5000

# 7. Start app
CMD ["node", "index.js"]
