namespace src.Interfaces
{
    public interface ITemplateService
    {
        Task<string> RenderAsync(string templateName, object data);
    }
}
