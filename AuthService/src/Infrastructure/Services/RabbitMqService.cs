using Application.Interfaces;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System;
using System.Text;

namespace Infrastructure.Services
{
    public class RabbitMqService : IRabbitMqService, IDisposable
    {
        private readonly IConnection _connection;
        private readonly Dictionary<string, IModel> _channels = new();

        public RabbitMqService()
        {
            var factory = new ConnectionFactory()
            {
                HostName = "localhost",
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

        private IModel GetOrCreateChannel(string queueName)
        {
            if (_channels.ContainsKey(queueName))
                return _channels[queueName];

            var channel = _connection.CreateModel();
            channel.QueueDeclare(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            _channels[queueName] = channel;
            return channel;
        }

        public void Publish(string queueName, object message)
        {
            var channel = GetOrCreateChannel(queueName);

            var json = JsonConvert.SerializeObject(message);
            var body = Encoding.UTF8.GetBytes(json);

            var props = channel.CreateBasicProperties();
            props.Persistent = true;

            channel.BasicPublish(
                exchange: "",
                routingKey: queueName,
                basicProperties: props,
                body: body
            );
        }

        public void Dispose()
        {
            foreach (var channel in _channels.Values)
            {
                channel?.Close();
                channel?.Dispose();
            }

            _connection?.Close();
            _connection?.Dispose();
        }
    }
}
