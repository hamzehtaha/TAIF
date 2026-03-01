using System;
using System.Collections.Generic;
using System.Text.Json;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class ContentService : ServiceBase<Content>, IContentService
    {
        private readonly IContentRepository _repository;

        public ContentService(IContentRepository repository) : base(repository)
        {
            _repository = repository;
        }

        public async Task<Content> CreateAsync(CreateContentRequest request, Guid organizationId)
        {
            Content content;

            switch (request.Type)
            {
                case LessonItemType.Quiz:
                    if (request.Quiz == null)
                        throw new Exception("Quiz data is required");

                    content = await CreateQuizContentAsync(request.Quiz, organizationId);
                    break;

                case LessonItemType.Video:
                    if (request.Video == null)
                        throw new Exception("Video data is required");

                    content = new Content(LessonItemType.Video, request.Video)
                    {
                        OrganizationId = organizationId
                    };
                    await _repository.AddAsync(content);
                    await _repository.SaveChangesAsync();
                    break;

                case LessonItemType.RichText:
                    if (request.RichText == null)
                        throw new Exception("RichText data is required");

                    content = new Content(LessonItemType.RichText, request.RichText)
                    {
                        OrganizationId = organizationId
                    };
                    await _repository.AddAsync(content);
                    await _repository.SaveChangesAsync();
                    break;

                default:
                    throw new Exception("Invalid content type");
            }

            return content;
        }

        public async Task<Content> UpdateAsync(Guid contentId, CreateContentRequest request)
        {
            Content updatedContent;

            switch (request.Type)
            {
                case LessonItemType.Quiz:
                    if (request.Quiz == null)
                        throw new Exception("Quiz data is required");

                    updatedContent = await UpdateQuizContentAsync(contentId, request.Quiz);
                    break;

                case LessonItemType.Video:
                case LessonItemType.RichText:
                    var content = await _repository.GetByIdAsync(contentId);
                    if (content == null)
                        throw new Exception("Content not found");

                    content.ContentData = request.Type == LessonItemType.Video
                        ? request.Video!
                        : request.RichText!;

                    _repository.Update(content);
                    await _repository.SaveChangesAsync();
                    updatedContent = content;
                    break;

                default:
                    throw new Exception("Invalid content type");
            }

            return updatedContent;
        }

        public async Task<Content> CreateQuizContentAsync(QuizCreateDto quizDto, Guid organizationId)
        {
            var quiz = MapToQuiz(quizDto, isCreate: true);
            
            var content = new Content(LessonItemType.Quiz, quiz)
            {
                OrganizationId = organizationId
            };
            
            await _repository.AddAsync(content);
            await _repository.SaveChangesAsync();
            return content;
        }

        public async Task<Content> UpdateQuizContentAsync(Guid contentId, QuizCreateDto quizDto)
        {
            var existingContent = await _repository.GetByIdAsync(contentId);
            if (existingContent == null)
                throw new Exception("Content not found");

            if (existingContent.Type != LessonItemType.Quiz)
                throw new Exception("Content is not a quiz");

            var quiz = MapToQuiz(quizDto, isCreate: false);
            
            existingContent.ContentData = quiz;
            
            _repository.Update(existingContent);
            await _repository.SaveChangesAsync();
            return existingContent;
        }

        private Quiz MapToQuiz(QuizCreateDto dto, bool isCreate)
        {
            var quiz = new Quiz
            {
                Title = dto.Title,
                Questions = new List<QuizQuestion>()
            };

            foreach (var questionDto in dto.Questions)
            {
                var question = new QuizQuestion
                {
                    QuestionText = questionDto.QuestionText,
                    ShuffleOptions = questionDto.ShuffleOptions,
                    Explanation = questionDto.Explanation,
                    Options = new List<QuizOption>()
                };

                // Handle Question ID
                if (string.IsNullOrEmpty(questionDto.Id))
                {
                    // New question - generate ID
                    question.Id = Guid.NewGuid().ToString();
                }
                else
                {
                    // Existing question - keep ID
                    question.Id = questionDto.Id;
                }

                // Handle Options
                foreach (var optionDto in questionDto.Options)
                {
                    var option = new QuizOption
                    {
                        Text = optionDto.Text
                    };

                    if (string.IsNullOrEmpty(optionDto.Id))
                    {
                        // New option - generate ID
                        option.Id = Guid.NewGuid().ToString();
                    }
                    else
                    {
                        // Existing option - keep ID
                        option.Id = optionDto.Id;
                    }

                    question.Options.Add(option);
                }

                // Handle Correct Answer
                if (!string.IsNullOrEmpty(questionDto.CorrectAnswerId))
                {
                    // Editing - already have option ID
                    question.CorrectAnswerId = questionDto.CorrectAnswerId;
                }
                else if (questionDto.CorrectAnswerIndex.HasValue)
                {
                    // Creating - convert index to option ID
                    if (questionDto.CorrectAnswerIndex.Value >= 0 && 
                        questionDto.CorrectAnswerIndex.Value < question.Options.Count)
                    {
                        question.CorrectAnswerId = question.Options[questionDto.CorrectAnswerIndex.Value].Id;
                    }
                    else
                    {
                        throw new Exception($"Invalid correct answer index for question: {questionDto.QuestionText}");
                    }
                }
                else
                {
                    throw new Exception($"No correct answer specified for question: {questionDto.QuestionText}");
                }

                quiz.Questions.Add(question);
            }

            return quiz;
        }
    }
}
