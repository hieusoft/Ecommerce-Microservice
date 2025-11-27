using src.DTOs;

namespace src.Interfaces
{
    public interface IWorkerService
    {
        Task HandleQueueMessageAsync(string queue, QueueMessageDto dto);
    }
}
