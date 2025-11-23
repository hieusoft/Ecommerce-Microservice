using Application.Interfaces;
using Newtonsoft.Json;
using RabbitMQ.Client;
using System;
using System.Collections.Generic;
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

        
        private IModel GetOrCreateChannel(string key)
        {
            if (_channels.TryGetValue(key, out var ch))
                return ch;

            var channel = _connection.CreateModel();
            _channels[key] = channel;
            return channel;
        }

     
        public void DeclareExchange(string exchangeName, string exchangeType = ExchangeType.Direct)
        {
            var channel = GetOrCreateChannel($"exchange:{exchangeName}");
            channel.ExchangeDeclare(exchange: exchangeName, type: exchangeType, durable: true);
        }

        public void DeclareQueueAndBind(string queueName, string exchangeName, IEnumerable<string> routingKeys)
        {
            var channel = GetOrCreateChannel($"queue:{queueName}");

          
            channel.QueueDeclare(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

         
            foreach (var key in routingKeys)
            {
                channel.QueueBind(
                    queue: queueName,
                    exchange: exchangeName,
                    routingKey: key
                );
            }
        }


        public void Publish(string exchangeName, string routingKey, object message)
        {
            var channel = GetOrCreateChannel($"exchange:{exchangeName}");

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
