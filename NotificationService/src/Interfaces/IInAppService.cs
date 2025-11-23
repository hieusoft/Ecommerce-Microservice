namespace src.Interfaces
{
    public interface IInAppService
    {
        Task SendInAppNotificationAsync(int userId, string title, string content);
    }
}
