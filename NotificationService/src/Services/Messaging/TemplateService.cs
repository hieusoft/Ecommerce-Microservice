using RazorLight;
using src.Interfaces;
using System.IO;
using System.Threading.Tasks;

namespace src.Services.Messaging
{
    public class TemplateService : ITemplateService
    {
        private readonly RazorLightEngine _engine;

        public TemplateService()
        {
            // Lấy đường dẫn tuyệt đối đến folder Templates
            var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "Templates");

            // Nếu chưa tồn tại folder, có thể tạo
            if (!Directory.Exists(rootPath))
                Directory.CreateDirectory(rootPath);

            _engine = new RazorLightEngineBuilder()
                .UseFileSystemProject(rootPath) // Đường dẫn tuyệt đối
                .UseMemoryCachingProvider()
                .Build();
        }

        public async Task<string> RenderAsync(string templateName, object data)
        {
            if (string.IsNullOrWhiteSpace(templateName))
                throw new ArgumentException("Template name is required.", nameof(templateName));

            string result = await _engine.CompileRenderAsync(templateName, data);
            return result;
        }
    }
}
