using Application.Interfaces;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;

namespace Infrastructure.Services
{
    public class RabbitMqService : IRabbitMqService, IDisposable
    {
        private readonly IConnection _connection;
        private IModel _channel;

        public RabbitMqService()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "rabbitmq",
                Port = 5672,
                UserName = "guest",
                Password = "guest"
            };

            try
            {
                _connection = factory.CreateConnection();
            }
            catch (Exception ex)
            {
                throw new Exception("Cannot connect to RabbitMQ", ex);
            }
        }

        private IModel GetChannel()
        {
            if (_channel != null)
                return _channel;

            _channel = _connection.CreateModel();
            return _channel;
        }

        
        public void DeclareExchange(string exchangeName, string exchangeType = ExchangeType.Direct)
        {
            var channel = GetChannel();
            channel.ExchangeDeclare(exchange: exchangeName, type: exchangeType, durable: true);
        }

        public void DeclareQueueAndBind(string queueName, string exchangeName, string routingKey)
        {
            var channel = GetChannel();

            channel.QueueDeclare(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            channel.QueueBind(
                queue: queueName,
                exchange: exchangeName,
                routingKey: routingKey
            );
        }
        public void Subscribe(string queueName, Func<string, string, Task> onMessageAsync)
        {
            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (model, ea) =>
            {
                var message = Encoding.UTF8.GetString(ea.Body.ToArray());
                var routingKey = ea.RoutingKey;

                try
                {
                    if (onMessageAsync != null)
                        await onMessageAsync(message, routingKey);
                    _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                catch
                {

                    _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            _channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
            Console.WriteLine($"Subscribed to queue {queueName}");
        }

        public void Publish(string exchangeName, string routingKey, object message)
        {
            var channel = GetChannel();

            var json = JsonConvert.SerializeObject(message);
            var body = Encoding.UTF8.GetBytes(json);

            var props = channel.CreateBasicProperties();
            props.Persistent = true;

            channel.BasicPublish(
                exchange: exchangeName,
                routingKey: routingKey,
                basicProperties: props,
                body: body
            );
        }

        public void Dispose()
        {
            try
            {
                _channel?.Close();
                _channel?.Dispose();
                _connection?.Close();
                _connection?.Dispose();
            }
            catch { }
        }
    }
}
