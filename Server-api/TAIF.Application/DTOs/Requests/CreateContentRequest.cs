using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.DTOs.Requests
{
    public record CreateContentRequest
    {
        public LessonItemType Type { get; set; }
        public Video? Video { get; set; }
        public RichText? RichText { get; set; }
        public QuizCreateDto? Quiz { get; set; }
        public Guid? OrganizationId { get; set; }
    }

    public record QuizCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public List<QuizQuestionCreateDto> Questions { get; set; } = new();
    }

    public record QuizQuestionCreateDto
    {
        public string? Id { get; set; }  // Optional - sent only when editing
        public string QuestionText { get; set; } = string.Empty;
        public bool ShuffleOptions { get; set; } = false;
        public List<QuizOptionDto> Options { get; set; } = new();
        public string? CorrectAnswerId { get; set; }  // For editing
        public int? CorrectAnswerIndex { get; set; }  // For creating
        public string? Explanation { get; set; }
    }

    public record QuizOptionDto
    {
        public string? Id { get; set; }  // Optional - sent only when editing
        public string Text { get; set; } = string.Empty;
    }
}
