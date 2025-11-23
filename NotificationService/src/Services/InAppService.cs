using src.Interfaces;

namespace src.Services
{
    public class InAppService : IInAppService
    {
        public Task SendInAppNotificationAsync(int userId, string title, string content)
        {
            throw new NotImplementedException();
        }
    }
}
