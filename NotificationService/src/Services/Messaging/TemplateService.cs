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
            var rootPath = Path.Combine(AppContext.BaseDirectory, "Templates");

            _engine = new RazorLightEngineBuilder()
                .UseFileSystemProject(rootPath)
                .UseMemoryCachingProvider()
                .Build();
        }

        public async Task<string> RenderAsync(string templateName, object data)
        {
            if (string.IsNullOrWhiteSpace(templateName))
                throw new ArgumentException("Template name is required.", nameof(templateName));

            return await _engine.CompileRenderAsync(templateName, data);
        }
    }
}
