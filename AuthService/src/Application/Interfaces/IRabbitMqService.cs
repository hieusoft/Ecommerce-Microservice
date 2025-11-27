using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IRabbitMqService
    {
        void DeclareExchange(string exchangeName, string exchangeType);


        void DeclareQueueAndBind(string queueName, string exchangeName, string routingKeys);

        void Publish(string exchangeName, string routingKey, object message);
        void Subscribe(string queueName, Func<string, string, Task> onMessageAsync);

    }
}
