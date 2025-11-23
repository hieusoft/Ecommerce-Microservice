using RazorLight;
using src.Interfaces;
using System.Threading.Tasks;

namespace src.Services
{
    public class TemplateService : ITemplateService
    {
        private readonly RazorLightEngine _engine;

        public TemplateService()
        {
            _engine = new RazorLightEngineBuilder()
                .UseFileSystemProject("Templates") 
                .UseMemoryCachingProvider()
                .Build();
        }

        public async Task<string> RenderAsync(string templateName, object data)
        {
            if (string.IsNullOrWhiteSpace(templateName))
                throw new ArgumentException("Template name is required.", nameof(templateName));

            var templatePath = $"{templateName}";

            string result = await _engine.CompileRenderAsync(templatePath, data);
            return result;
        }
    }
}
