using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TAIF.Application.Interfaces.Services
{
    public interface IAiHelperService
    {
        Task<string> AskAsync(string userInput, CancellationToken cancellationToken = default);
    }
}
