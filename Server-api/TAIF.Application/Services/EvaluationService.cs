using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using TAIF.Domain.Models;

namespace TAIF.Application.Services
{
    public class EvaluationService : ServiceBase<Evaluation>, IEvaluationService
    {
        private readonly IEvaluationRepository _repository;
        private readonly IEvaluationQuestionMappingRepository _mappingRepository;

        public EvaluationService(
            IEvaluationRepository repository, 
            IEvaluationQuestionMappingRepository mappingRepository,
            IEvaluationAnswerRepository answerRepository, 
            IQuestionRepository questionRepository)
            : base(repository)
        {
            _repository = repository;
            _mappingRepository = mappingRepository;
        }

        public async Task<Evaluation> UpdateWithMappingsAsync(Guid id, Evaluation updatedEvaluation)
        {
            var existingEvaluation = await _repository.GetByIdAsync(id);
            if (existingEvaluation == null)
                throw new Exception($"Evaluation with id {id} not found");

            // Update basic properties
            existingEvaluation.Name = updatedEvaluation.Name;
            existingEvaluation.Description = updatedEvaluation.Description;
            existingEvaluation.InterestId = updatedEvaluation.InterestId;

            // Delete existing mappings in bulk
            var existingMappings = await _mappingRepository.GetByEvaluationIdAsync(id);
            if (existingMappings.Count > 0)
            {
                _mappingRepository.PermanentDeleteRange(existingMappings);
            }

            // Add new mappings in bulk
            foreach (var newMapping in updatedEvaluation.QuestionMappings)
            {
                newMapping.EvaluationId = id;
            }
            if (updatedEvaluation.QuestionMappings.Any())
            {
                await _mappingRepository.AddRangeAsync(updatedEvaluation.QuestionMappings);
            }

            await _repository.SaveChangesAsync();

            // Reload to get the updated entity with mappings
            return await _repository.GetByIdAsync(id) ?? existingEvaluation;
        }
    }
}
