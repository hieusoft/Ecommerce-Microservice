
FROM node:18-alpine


WORKDIR /app


COPY package*.json ./


RUN npm install --production

# 5. Copy toàn bộ service vào container
COPY . .

# 6. Expose port (trùng với PORT trong env hoặc docker-compose)
EXPOSE 8083

# 7. Start app
CMD ["node", "index.js"]