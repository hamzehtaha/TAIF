# API Modifications for Instructor Portal

This document outlines all the API changes needed to support the Instructor Portal frontend.

---

## Table of Contents
1. [Summary](#summary)
2. [APIs to Add](#apis-to-add)
3. [APIs to Update](#apis-to-update)
4. [Entities to Update/Create](#entities-to-updatecreate)
5. [DTOs to Update/Create](#dtos-to-updatecreate)
6. [Services to Update/Create](#services-to-updatecreate)

---

## Summary

| Category | Add | Update |
|----------|-----|--------|
| API Endpoints | 15 | 3 |
| Entities | 1 | 3 |
| DTOs | 12 | 4 |
| Services | 1 | 3 |

---

## APIs to Add

### 1. Instructor Controller (NEW)
> Create new `InstructorController.cs`

| Method | Endpoint | Description | Request DTO | Response DTO |
|--------|----------|-------------|-------------|--------------|
| `GET` | `/api/instructor/profile` | Get current instructor profile | - | `InstructorProfileResponse` |
| `PUT` | `/api/instructor/profile` | Update instructor profile | `UpdateInstructorProfileRequest` | `InstructorProfileResponse` |
| `GET` | `/api/instructor/dashboard/stats` | Get dashboard statistics | - | `InstructorDashboardStatsResponse` |
| `GET` | `/api/instructor/courses` | Get instructor's courses with stats | `CourseFilter` | `PagedResult<CourseWithStatsResponse>` |

### 2. Course Controller Additions
> Add to existing `CourseController.cs`

| Method | Endpoint | Description | Request DTO | Response DTO |
|--------|----------|-------------|-------------|--------------|
| `GET` | `/api/course/{id}/details` | Get course with lessons and stats | - | `CourseDetailsResponse` |
| `PUT` | `/api/course/{id}/publish` | Publish a course | - | `Course` |
| `PUT` | `/api/course/{id}/unpublish` | Unpublish a course | - | `Course` |
| `PUT` | `/api/course/{id}/archive` | Archive a course | - | `Course` |
| `POST` | `/api/course/{id}/lessons` | Add lessons to course | `AddLessonsToCourseRequest` | `CourseDetailsResponse` |
| `DELETE` | `/api/course/{courseId}/lessons/{lessonId}` | Remove lesson from course | - | `CourseDetailsResponse` |
| `PUT` | `/api/course/{id}/lessons/reorder` | Reorder lessons in course | `ReorderLessonsRequest` | `CourseDetailsResponse` |

### 3. Lesson Controller Additions
> Add to existing `LessonController.cs`

| Method | Endpoint | Description | Request DTO | Response DTO |
|--------|----------|-------------|-------------|--------------|
| `GET` | `/api/lesson` | Get all lessons (for instructor) | `LessonFilter` | `List<Lesson>` |
| `GET` | `/api/lesson/{id}/items` | Get lesson with all items | - | `LessonWithItemsResponse` |
| `POST` | `/api/lesson/{id}/items` | Add items to lesson | `AddItemsToLessonRequest` | `LessonWithItemsResponse` |
| `DELETE` | `/api/lesson/{lessonId}/items/{itemId}` | Remove item from lesson | - | `LessonWithItemsResponse` |
| `PUT` | `/api/lesson/{id}/items/reorder` | Reorder items in lesson | `ReorderLessonItemsRequest` | `LessonWithItemsResponse` |

### 4. LessonItem Controller Additions
> Add to existing `LessonItemController.cs`

| Method | Endpoint | Description | Request DTO | Response DTO |
|--------|----------|-------------|-------------|--------------|
| `GET` | `/api/lesson-item` | Get all lesson items with filters | `LessonItemFilter` | `List<LessonItem>` |
| `GET` | `/api/lesson-item/standalone` | Get standalone items (not in lessons) | `LessonItemFilter` | `List<LessonItem>` |

---

## APIs to Update

### 1. Course Controller Updates

#### `POST /api/course` - Create Course
**Current:**
```csharp
public record CreateCourseRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Photo { get; set; }
    public Guid CategoryId { get; set; }
    public List<Guid> Tags { get; set; }
}
```

**Required Changes:**
- Add `InstructorId` field (set from authenticated user)
- Add `Status` field with default `Draft`

---

#### `PUT /api/course/{id}` - Update Course
**Current:**
```csharp
public record UpdateCourseRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Photo { get; set; }
    public List<Guid>? Tags { get; set; }
}
```

**Required Changes:**
- Add `CategoryId` field
- Add `Status` field

---

### 2. Lesson Controller Updates

#### `POST /api/lesson` - Create Lesson
**Current:**
```csharp
public record CreateLessonRequest
{
    public string Title { get; set; }
    public string URL { get; set; }  // Not needed
    public Guid CourseId { get; set; }
    public string? Photo { get; set; }
}
```

**Required Changes:**
- Remove `URL` field (not used)
- Add `Description` field
- Add `Order` field
- Make `CourseId` optional (for standalone lessons)

---

### 3. LessonItem Controller Updates

#### `POST /api/lesson-item` - Create LessonItem
**Current:** `LessonId` is required

**Required Changes:**
- Make `LessonId` optional (for standalone content items)
- Add `Order` field

---

## Entities to Update/Create

### 1. Course Entity (UPDATE)
**File:** `TAIF.Domain/Entities/Course.cs`

```csharp
// ADD these properties:
public Guid? InstructorId { get; set; }
public User? Instructor { get; set; }
public CourseStatus Status { get; set; } = CourseStatus.Draft;
```

### 2. Lesson Entity (UPDATE)
**File:** `TAIF.Domain/Entities/Lesson.cs`

```csharp
// ADD this property:
public string? Description { get; set; }

// CHANGE CourseId to nullable:
public Guid? CourseId { get; set; }  // Was: public Guid CourseId { get; set; }

// Make LessonItems public:
public ICollection<LessonItem> LessonItems { get; set; } = new List<LessonItem>();
```

### 3. LessonItem Entity (UPDATE)
**File:** `TAIF.Domain/Entities/LessonItem.cs`

```csharp
// CHANGE LessonId to nullable (for standalone items):
public Guid? LessonId { get; set; }  // Was: public Guid LessonId { get; set; }
```

### 4. Enums Entity (UPDATE)
**File:** `TAIF.Domain/Entities/Enums.cs`

```csharp
// ADD CourseStatus enum:
public enum CourseStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}

// ADD UserRole enum:
public enum UserRole
{
    Student = 0,
    Instructor = 1,
    Admin = 2
}
```

### 5. User Entity (UPDATE) - Optional
**File:** `TAIF.Domain/Entities/User.cs`

```csharp
// ADD for instructor support:
public UserRole Role { get; set; } = UserRole.Student;
public string? Bio { get; set; }
public string? Specialization { get; set; }
public string? Avatar { get; set; }
```

---

## DTOs to Update/Create

### DTOs to CREATE

#### 1. InstructorProfileResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record InstructorProfileResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public string? Specialization { get; set; }
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
    }
}
```

#### 2. UpdateInstructorProfileRequest.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record UpdateInstructorProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public string? Specialization { get; set; }
    }
}
```

#### 3. InstructorDashboardStatsResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record InstructorDashboardStatsResponse
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalLessons { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public int RecentEnrollments { get; set; }
        public int PublishedCourses { get; set; }
        public int DraftCourses { get; set; }
        public int ArchivedCourses { get; set; }
    }
}
```

#### 4. CourseDetailsResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record CourseDetailsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public CourseStatus Status { get; set; }
        public Guid? InstructorId { get; set; }
        public List<Guid> Tags { get; set; } = new();
        public List<LessonWithItemsResponse> Lessons { get; set; } = new();
        public CourseStatsResponse Stats { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

#### 5. CourseStatsResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record CourseStatsResponse
    {
        public int TotalEnrollments { get; set; }
        public int TotalLessons { get; set; }
        public int TotalItems { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public double CompletionRate { get; set; }
    }
}
```

#### 6. CourseWithStatsResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record CourseWithStatsResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public CourseStatus Status { get; set; }
        public List<Guid> Tags { get; set; } = new();
        public CourseStatsResponse Stats { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

#### 7. LessonWithItemsResponse.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record LessonWithItemsResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Photo { get; set; }
        public Guid? CourseId { get; set; }
        public int Order { get; set; }
        public List<LessonItemResponse> LessonItems { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
```

#### 8. AddLessonsToCourseRequest.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record AddLessonsToCourseRequest
    {
        [Required]
        public List<Guid> LessonIds { get; set; } = new();
    }
}
```

#### 9. ReorderLessonsRequest.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record ReorderLessonsRequest
    {
        [Required]
        public List<Guid> LessonIds { get; set; } = new();
    }
}
```

#### 10. AddItemsToLessonRequest.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record AddItemsToLessonRequest
    {
        [Required]
        public List<Guid> LessonItemIds { get; set; } = new();
    }
}
```

#### 11. ReorderLessonItemsRequest.cs (NEW)
```csharp
namespace TAIF.Application.DTOs
{
    public record ReorderLessonItemsRequest
    {
        [Required]
        public List<Guid> LessonItemIds { get; set; } = new();
    }
}
```

#### 12. LessonItemFilter.cs (NEW)
**File:** `TAIF.Application/DTOs/Filters/LessonItemFilter.cs`
```csharp
namespace TAIF.Application.DTOs.Filters
{
    public record LessonItemFilter : PaginationFilter
    {
        public LessonItemType? Type { get; set; }
        public Guid? LessonId { get; set; }
        public bool? IsStandalone { get; set; }
        public string? Search { get; set; }
    }
}
```

---

### DTOs to UPDATE

#### 1. UpdateCourseRequest.cs (UPDATE)
```csharp
// ADD:
public Guid? CategoryId { get; set; }
public CourseStatus? Status { get; set; }
```

#### 2. CreateLessonRequest.cs (UPDATE)
```csharp
// REMOVE: public string URL { get; set; }
// ADD:
public string? Description { get; set; }
public int? Order { get; set; }
// CHANGE: Make CourseId optional
public Guid? CourseId { get; set; }
```

#### 3. UpdateLessonRequest.cs (UPDATE)
```csharp
// REMOVE: public string? URL { get; set; }
// ADD:
public string? Description { get; set; }
public int? Order { get; set; }
```

#### 4. CreateLessonItemRequest.cs (UPDATE)
```csharp
// CHANGE: Make LessonId optional
public Guid? LessonId { get; set; }
// ADD:
public int? Order { get; set; }
```

---

## Services to Update/Create

### 1. IInstructorService.cs (NEW)
```csharp
namespace TAIF.Application.Interfaces.Services
{
    public interface IInstructorService
    {
        Task<InstructorProfileResponse> GetProfileAsync(Guid userId);
        Task<InstructorProfileResponse> UpdateProfileAsync(Guid userId, UpdateInstructorProfileRequest request);
        Task<InstructorDashboardStatsResponse> GetDashboardStatsAsync(Guid instructorId);
        Task<PagedResult<CourseWithStatsResponse>> GetInstructorCoursesAsync(Guid instructorId, CourseFilter filter);
    }
}
```

### 2. ICourseService.cs (UPDATE)
```csharp
// ADD methods:
Task<CourseDetailsResponse> GetCourseDetailsAsync(Guid courseId);
Task<Course> PublishCourseAsync(Guid courseId);
Task<Course> UnpublishCourseAsync(Guid courseId);
Task<Course> ArchiveCourseAsync(Guid courseId);
Task<CourseDetailsResponse> AddLessonsToCourseAsync(Guid courseId, List<Guid> lessonIds);
Task<CourseDetailsResponse> RemoveLessonFromCourseAsync(Guid courseId, Guid lessonId);
Task<CourseDetailsResponse> ReorderCourseLessonsAsync(Guid courseId, List<Guid> lessonIds);
Task<List<Course>> GetByInstructorIdAsync(Guid instructorId);
```

### 3. ILessonService.cs (UPDATE)
```csharp
// ADD methods:
Task<List<Lesson>> GetAllAsync();
Task<LessonWithItemsResponse> GetLessonWithItemsAsync(Guid lessonId);
Task<LessonWithItemsResponse> AddItemsToLessonAsync(Guid lessonId, List<Guid> itemIds);
Task<LessonWithItemsResponse> RemoveItemFromLessonAsync(Guid lessonId, Guid itemId);
Task<LessonWithItemsResponse> ReorderLessonItemsAsync(Guid lessonId, List<Guid> itemIds);
```

### 4. ILessonItemService.cs (UPDATE)
```csharp
// ADD methods:
Task<List<LessonItem>> GetAllAsync(LessonItemFilter filter);
Task<List<LessonItem>> GetStandaloneItemsAsync(LessonItemFilter filter);
```

---

## Database Migrations Required

After entity changes, run:
```bash
dotnet ef migrations add AddInstructorPortalSupport
dotnet ef database update
```

### Migration Changes:
1. Add `InstructorId`, `Status` columns to `Courses` table
2. Add `Description` column to `Lessons` table
3. Make `CourseId` nullable in `Lessons` table
4. Make `LessonId` nullable in `LessonItems` table
5. Add `Role`, `Bio`, `Specialization`, `Avatar` columns to `Users` table
6. Add foreign key from `Courses.InstructorId` to `Users.Id`

---

## Frontend API Endpoint Mapping

| Frontend Service | Method | Backend Endpoint |
|-----------------|--------|------------------|
| `instructorService.getProfile()` | GET | `/api/instructor/profile` |
| `instructorService.getDashboardStats()` | GET | `/api/instructor/dashboard/stats` |
| `courseService.getAll()` | GET | `/api/course` |
| `courseService.getById(id)` | GET | `/api/course/{id}` |
| `courseService.getWithDetails(id)` | GET | `/api/course/{id}/details` |
| `courseService.create(request)` | POST | `/api/course` |
| `courseService.update(id, request)` | PUT | `/api/course/{id}` |
| `courseService.delete(id)` | DELETE | `/api/course/{id}` |
| `courseService.publish(id)` | PUT | `/api/course/{id}/publish` |
| `courseService.unpublish(id)` | PUT | `/api/course/{id}/unpublish` |
| `courseService.archive(id)` | PUT | `/api/course/{id}/archive` |
| `courseService.addLessons(courseId, request)` | POST | `/api/course/{id}/lessons` |
| `courseService.removeLesson(courseId, lessonId)` | DELETE | `/api/course/{courseId}/lessons/{lessonId}` |
| `courseService.reorderLessons(courseId, request)` | PUT | `/api/course/{id}/lessons/reorder` |
| `lessonService.getAll()` | GET | `/api/lesson` |
| `lessonService.getById(id)` | GET | `/api/lesson/{id}` |
| `lessonService.getWithItems(id)` | GET | `/api/lesson/{id}/items` |
| `lessonService.getByCourseId(courseId)` | GET | `/api/lesson/course/{courseId}` |
| `lessonService.create(request)` | POST | `/api/lesson` |
| `lessonService.update(id, request)` | PUT | `/api/lesson/{id}` |
| `lessonService.delete(id)` | DELETE | `/api/lesson/{id}` |
| `lessonService.addItems(lessonId, request)` | POST | `/api/lesson/{id}/items` |
| `lessonService.removeItem(lessonId, itemId)` | DELETE | `/api/lesson/{lessonId}/items/{itemId}` |
| `lessonService.reorderItems(lessonId, request)` | PUT | `/api/lesson/{id}/items/reorder` |
| `contentService.getVideos()` | GET | `/api/lesson-item?type=0` |
| `contentService.getRichContents()` | GET | `/api/lesson-item?type=1` |
| `contentService.getQuestions()` | GET | `/api/lesson-item?type=2` |
| `contentService.createVideo(request)` | POST | `/api/lesson-item` |
| `contentService.updateVideo(id, request)` | PUT | `/api/lesson-item/{id}` |
| `contentService.deleteVideo(id)` | DELETE | `/api/lesson-item/{id}` |
| `categoryService.getAll()` | GET | `/api/category` |
| `categoryService.getById(id)` | GET | `/api/category/{id}` |

---

## Implementation Priority

### Phase 1 - Core (High Priority)
1. Update `Course` entity with `Status` and `InstructorId`
2. Update `Lesson` entity with `Description`
3. Add `CourseStatus` enum
4. Update `CreateCourseRequest` and `UpdateCourseRequest` DTOs
5. Add publish/unpublish/archive endpoints

### Phase 2 - Instructor Dashboard (Medium Priority)
1. Create `InstructorController`
2. Create `IInstructorService` and implementation
3. Add dashboard stats endpoint
4. Add instructor profile endpoints

### Phase 3 - Content Management (Medium Priority)
1. Make `LessonId` optional in `LessonItem`
2. Add lesson-course relationship management endpoints
3. Add lesson item management endpoints
4. Add reorder endpoints

### Phase 4 - Advanced Features (Low Priority)
1. Add filtering to lesson items endpoint
2. Add standalone content support
3. Add bulk operations
