using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;

namespace TAIF.Application.Services
{
    public class AnswerService : ServiceBase<Answer>, IAnswerService
    {
        private readonly IAnswerRepository _repository;
        public AnswerService(IAnswerRepository repository) : base(repository)
        {
            _repository = repository;
        }
    }
}
