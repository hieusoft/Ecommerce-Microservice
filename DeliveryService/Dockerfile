version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: delivery_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
  delivery-service:
    build: .
    depends_on:
      - mysql
      - rabbitmq
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/delivery_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
      SPRING_RABBITMQ_HOST: rabbitmq
      SPRING_RABBITMQ_PORT: 5672
    ports:
      - "8080:8080"
volumes:
  mysql-data:
