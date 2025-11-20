using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IRabbitMqService
    {
        void Publish(string queueName, object message);
        
    }
}
