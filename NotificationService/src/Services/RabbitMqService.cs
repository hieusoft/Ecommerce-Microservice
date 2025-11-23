using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using src.Interfaces;
using System.Text;
using System.Threading.Tasks;

namespace src.Services
{
    public class RabbitMqService : IRabbitMqService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;

        public RabbitMqService()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost",
                Port = 5672,
                UserName = "guest",
                Password = "guest"
            };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
        }

        public void DeclareExchange(string exchangeName, string exchangeType)
        {
            _channel.ExchangeDeclare(exchange: exchangeName, type: exchangeType, durable: true);
        }

        public void DeclareQueueAndBind(string queueName, string exchangeName, IEnumerable<string> routingKeys)
        {
            _channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false);
            foreach (var key in routingKeys)
            {
                _channel.QueueBind(queue: queueName, exchange: exchangeName, routingKey: key);
            }
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
            var body = Encoding.UTF8.GetBytes(System.Text.Json.JsonSerializer.Serialize(message));
            _channel.BasicPublish(exchange: exchangeName, routingKey: routingKey, basicProperties: null, body: body);
        }

       
    }
}
