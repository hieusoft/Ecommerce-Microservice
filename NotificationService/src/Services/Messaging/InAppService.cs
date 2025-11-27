using src.Interfaces;

namespace src.Services.Messaging
{
    public class InAppService : IInAppService
    {
        public Task SendInAppNotificationAsync(int userId, string title, string content)
        {
            throw new NotImplementedException();
        }
    }
}
