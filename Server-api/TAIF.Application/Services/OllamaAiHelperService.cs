using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using OllamaSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.DTOs;
using TAIF.Application.Interfaces.Services;

namespace TAIF.Application.Services
{

    public class OllamaAiHelperService : IAiHelperService
    {
        private readonly OllamaApiClient _client;

        public OllamaAiHelperService(IConfiguration configuration)
        {
            var model = configuration["AiOptions:Model"] ?? "gemma3:4b";
            var url = configuration["AiOptions:Url"] ?? "http://localhost:11434";
            _client = new OllamaApiClient(new Uri(url));
            _client.SelectedModel = model;
        }

        public async Task<string> AskAsync(string userInput, CancellationToken cancellationToken = default)
        {
            var context = new ConversationContext(Array.Empty<long>());

            // Inject system prompt
            await foreach (var _ in _client.GenerateAsync(TaifAiGuidelines.SystemPrompt, context, cancellationToken))
            {
            }

            var builder = new StringBuilder();

            await foreach (var chunk in _client.GenerateAsync(userInput, context, cancellationToken))
            {
                if (chunk != null)
                    builder.Append(chunk.Response);
            }

            return builder.ToString();
        }
    }
}
