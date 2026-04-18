using System.Text.Json;
using TAIF.Application.DTOs.Requests;
using TAIF.Application.DTOs.Responses;
using TAIF.Application.Interfaces.Repositories;
using TAIF.Application.Interfaces.Services;
using TAIF.Domain.Entities;
using static TAIF.Domain.Entities.Enums;

namespace TAIF.Application.Services
{
    public class CourseService : ServiceBase<Course> , ICourseService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IRecommendationService _recommendationService;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonItemRepository _lessonItemRepository;
        private readonly IContentRepository _contentRepository;
        private readonly ICourseLessonRepository _courseLessonRepository;
        private readonly ILessonLessonItemRepository _lessonLessonItemRepository;

        public CourseService(
            ICourseRepository repository, 
            IRecommendationService recommendationService,
            ILessonRepository lessonRepository,
            ILessonItemRepository lessonItemRepository,
            IContentRepository contentRepository,
            ICourseLessonRepository courseLessonRepository,
            ILessonLessonItemRepository lessonLessonItemRepository) : base(repository)
        {
            _courseRepository = repository;
            _recommendationService = recommendationService;
            _lessonRepository = lessonRepository;
            _lessonItemRepository = lessonItemRepository;
            _contentRepository = contentRepository;
            _courseLessonRepository = courseLessonRepository;
            _lessonLessonItemRepository = lessonLessonItemRepository;
        }

        public override async Task<Course?> GetByIdAsync(Guid id, bool withDeleted = false)
        {
            return await _courseRepository.GetByIdWithCategoryAsync(id, withDeleted);
        }

        public async Task<List<Course>> GetByCategoryIdAsync(Guid categoryId)
        {
            return await _courseRepository.GetByCategoryIdAsync(categoryId);
        }

        public async Task<List<Course>> GetRecommendedCoursesAsync(Guid userId, int limit = 10)
        {
            return await _recommendationService.GetRecommendedCoursesAsync(userId, limit);
        }

        public async Task<List<Course>> GetByUserIdAsync(Guid userId)
        {
            return await _courseRepository.GetByUserIdAsync(userId);
        }

        public async Task<List<Guid>> GetCourseIdsByUserAsync(Guid userId)
        {
            var courses = await _courseRepository.GetByUserIdAsync(userId);
            return courses.Select(c => c.Id).ToList();
        }

        public async Task<CreateFullCourseResponse> CreateFullCourseAsync(CreateFullCourseRequest request, Guid creatorId)
        {
            await using var transaction = (IAsyncDisposable)await _courseRepository.BeginTransactionAsync();
            try
            {
                int lessonsCreated = 0;
                int lessonItemsCreated = 0;
                int contentsCreated = 0;

            // Step 1: Create the course
            var course = new Course
            {
                Name = request.Name,
                Description = request.Description,
                Photo = request.Photo,
                CategoryId = request.CategoryId,
                Status = CourseStatus.Draft,
                CreatedBy = creatorId
            };
            await _courseRepository.AddAsync(course);

            // Step 2: Create or reference lessons and assign to course
            foreach (var lessonRequest in request.Lessons.OrderBy(l => l.Order))
            {
                Guid lessonId;

                // Use existing lesson or create new one
                if (lessonRequest.LessonId.HasValue && lessonRequest.LessonId.Value != Guid.Empty)
                {
                    // Reference existing lesson
                    lessonId = lessonRequest.LessonId.Value;
                }
                else
                {
                    // Create new lesson
                    if (string.IsNullOrWhiteSpace(lessonRequest.Title))
                    {
                        throw new ArgumentException("Lesson title is required when creating a new lesson.");
                    }

                    var lesson = new Lesson
                    {
                        Title = lessonRequest.Title!,
                        Description = lessonRequest.Description,
                        Photo = lessonRequest.Photo,
                        InstructorId = lessonRequest.InstructorId
                    };
                    await _lessonRepository.AddAsync(lesson);
                    lessonId = lesson.Id;
                    lessonsCreated++;
                }

                // Assign lesson to course
                var courseLesson = new CourseLesson
                {
                    CourseId = course.Id,
                    LessonId = lessonId,
                    Order = lessonRequest.Order
                };
                await _courseLessonRepository.AddAsync(courseLesson);

                // Step 3: Create lesson items for this lesson (only for new lessons)
                // Skip for existing lessons to prevent modifying lessons used by other courses
                if (lessonRequest.LessonId.HasValue && lessonRequest.LessonId.Value != Guid.Empty)
                {
                    // Existing lesson - skip creating new lesson items
                    continue;
                }

                foreach (var itemRequest in lessonRequest.Items.OrderBy(i => i.Order))
                {
                    Guid lessonItemId;

                    // Use existing lesson item or create new one
                    if (itemRequest.LessonItemId.HasValue && itemRequest.LessonItemId.Value != Guid.Empty)
                    {
                        // Reference existing lesson item
                        lessonItemId = itemRequest.LessonItemId.Value;
                    }
                    else
                    {
                        // Create new lesson item
                        if (string.IsNullOrWhiteSpace(itemRequest.Name))
                        {
                            throw new ArgumentException("Lesson item name is required when creating a new lesson item.");
                        }

                        Guid contentId;

                        // Use existing content or create new content
                        if (itemRequest.ContentId.HasValue && itemRequest.ContentId.Value != Guid.Empty)
                        {
                            contentId = itemRequest.ContentId.Value;
                        }
                        else if (itemRequest.Content != null)
                        {
                            // Create new content based on type
                            var content = CreateContentFromRequest(itemRequest.Type, itemRequest.Content);
                            await _contentRepository.AddAsync(content);
                            contentId = content.Id;
                            contentsCreated++;
                        }
                        else
                        {
                            throw new ArgumentException($"Lesson item '{itemRequest.Name}' must have either ContentId or Content data.");
                        }

                        // Create lesson item
                        var lessonItem = new LessonItem
                        {
                            Name = itemRequest.Name!,
                            Description = itemRequest.Description,
                            Type = (LessonItemType)itemRequest.Type,
                            ContentId = contentId,
                            DurationInSeconds = itemRequest.DurationInSeconds,
                            SkillIds = itemRequest.SkillIds ?? new List<Guid>()
                        };
                        await _lessonItemRepository.AddAsync(lessonItem);
                        lessonItemId = lessonItem.Id;
                        lessonItemsCreated++;
                    }

                    // Assign lesson item to lesson
                    var lessonLessonItem = new LessonLessonItem
                    {
                        LessonId = lessonId,
                        LessonItemId = lessonItemId,
                        Order = itemRequest.Order
                    };
                    await _lessonLessonItemRepository.AddAsync(lessonLessonItem);
                }
            }

            // Save all changes
            await _courseRepository.SaveChangesAsync();
            await _courseRepository.CommitTransactionAsync();

            return new CreateFullCourseResponse
            {
                CourseId = course.Id,
                CourseName = course.Name,
                LessonsCreated = lessonsCreated,
                LessonItemsCreated = lessonItemsCreated,
                ContentsCreated = contentsCreated,
                CreatedAt = course.CreatedAt
            };
            }
            catch
            {
                await _courseRepository.RollbackTransactionAsync();
                throw;
            }
        }

        private Content CreateContentFromRequest(int type, CreateFullCourseContentRequest contentRequest)
        {
            var contentType = (LessonItemType)type;

            switch (contentType)
            {
                case LessonItemType.Video:
                    if (contentRequest.Video == null)
                        throw new ArgumentException("Video content data is required for video type.");
                    
                    var videoData = new Video
                    {
                        Title = contentRequest.Video.Title,
                        Description = contentRequest.Video.Description,
                        ThumbnailUrl = contentRequest.Video.ThumbnailUrl,
                        DurationInSeconds = contentRequest.Video.DurationInSeconds,
                        VideoAssetId = contentRequest.Video.VideoAssetId,
                        PlaybackId = contentRequest.Video.PlaybackId,
                        Provider = contentRequest.Video.Provider
                    };
                    return new Content(contentType, videoData);

                case LessonItemType.RichText:
                    if (contentRequest.RichText == null)
                        throw new ArgumentException("Rich text content data is required for rich content type.");
                    
                    var richTextData = new RichText
                    {
                        Title = contentRequest.RichText.Title,
                        Html = contentRequest.RichText.HtmlContent
                    };
                    return new Content(contentType, richTextData);

                case LessonItemType.Quiz:
                    if (contentRequest.Quiz == null)
                        throw new ArgumentException("Quiz content data is required for quiz type.");
                    
                    var quizData = new Quiz
                    {
                        Title = contentRequest.Quiz.Title,
                        Questions = contentRequest.Quiz.Questions.Select(q => new QuizQuestion
                        {
                            Id = Guid.NewGuid().ToString(),
                            QuestionText = q.QuestionText,
                            Options = q.Options.Select((opt, idx) => new QuizOption
                            {
                                Id = idx.ToString(),
                                Text = opt
                            }).ToList(),
                            CorrectAnswerId = q.CorrectAnswerIndex.ToString()
                        }).ToList()
                    };
                    return new Content(contentType, quizData);

                case LessonItemType.Resource:
                    if (contentRequest.Resource == null)
                        throw new ArgumentException("Resource content data is required for resource type.");

                    var resourceData = new Resource
                    {
                        Title = contentRequest.Resource.Title,
                        Description = contentRequest.Resource.Description,
                        FileUrl = contentRequest.Resource.FileUrl,
                        FileName = contentRequest.Resource.FileName,
                        FileSize = contentRequest.Resource.FileSize,
                        ContentType = contentRequest.Resource.ContentType
                    };
                    return new Content(contentType, resourceData);

                default:
                    throw new ArgumentException($"Unknown content type: {type}");
            }
        }
    }
}