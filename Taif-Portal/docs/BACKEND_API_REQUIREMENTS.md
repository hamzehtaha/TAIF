# Backend API Requirements for Instructor Portal

This document outlines the required API endpoints and modifications needed on the Server-API (.NET) backend to support the instructor portal features.

## Current API Analysis

### Existing Endpoints (from Server-API)

#### CourseController
- `GET /api/course` - Get all courses
- `GET /api/course/paged` - Get paged courses with filters
- `GET /api/course/{id}` - Get course by ID
- `GET /api/course/category/{categoryId}` - Get courses by category
- `GET /api/course/recommended` - Get recommended courses
- `POST /api/course` - Create course
- `PUT /api/course/{id}` - Update course
- `DELETE /api/course/{id}` - Delete course

#### LessonController
- `GET /api/lesson/{id}` - Get lesson by ID
- `GET /api/lesson/paged` - Get paged lessons with filters
- `GET /api/lesson/course/{courseId}` - Get lessons by course ID
- `POST /api/lesson` - Create lesson
- `PUT /api/lesson/{id}` - Update lesson
- `DELETE /api/lesson/{id}` - Delete lesson

#### LessonItemController
- `GET /api/lessonitem/{id}` - Get lesson item by ID
- `GET /api/lessonitem/lesson/{lessonId}` - Get lesson items by lesson ID
- `GET /api/lessonitem/lessonProgress/{lessonId}` - Get lesson items progress
- `POST /api/lessonitem` - Create lesson item
- `PUT /api/lessonitem/{id}` - Update lesson item
- `DELETE /api/lessonitem/{id}` - Delete lesson item
- `POST /api/lessonitem/submit-quiz` - Submit quiz answers

---

## Required New Endpoints

### 1. Course Status Management

Add course lifecycle status (draft, published, archived) support.

#### Entity Changes (Course.cs)
```csharp
public enum CourseStatus
{
    Draft = 0,
    Published = 1,
    Archived = 2
}

public class Course : Base
{
    // ... existing properties
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    public Guid? InstructorId { get; set; }
    public User? Instructor { get; set; }
}
```

#### New Endpoints
```
PUT /api/course/{id}/publish
PUT /api/course/{id}/unpublish
PUT /api/course/{id}/archive
```

### 2. Course-Lesson Relationship Management

Support adding/removing standalone lessons to/from courses.

#### New Endpoints
```
POST /api/course/{courseId}/lessons
Request Body: { "lessonIds": ["guid1", "guid2"] }
Response: Course with updated lessons

DELETE /api/course/{courseId}/lessons/{lessonId}
Response: Course with updated lessons

PUT /api/course/{courseId}/lessons/reorder
Request Body: { "lessonIds": ["guid1", "guid2", "guid3"] }
Response: Course with reordered lessons
```

### 3. Course Details Endpoint

Get course with full details including lessons, items, and stats.

#### New Endpoint
```
GET /api/course/{id}/details
Response: {
    "id": "guid",
    "name": "string",
    "description": "string",
    "photo": "string",
    "categoryId": "guid",
    "status": "draft|published|archived",
    "lessons": [
        {
            "id": "guid",
            "title": "string",
            "order": 1,
            "lessonItems": [
                { "id": "guid", "name": "string", "type": 0, "order": 1 }
            ]
        }
    ],
    "stats": {
        "totalEnrollments": 100,
        "totalLessons": 5,
        "totalItems": 15,
        "averageRating": 4.5,
        "totalReviews": 25,
        "completionRate": 0.75
    }
}
```

### 4. Standalone Lessons (Optional CourseId)

Allow lessons to exist without being attached to a course.

#### Entity Changes (Lesson.cs)
```csharp
public class Lesson : Base
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }  // ADD THIS
    public Guid? CourseId { get; set; }  // MAKE NULLABLE
    public Course? Course { get; set; }
    public string? Photo { get; set; }
    public int Order { get; set; }
    public ICollection<LessonItem> LessonItems { get; set; } = new List<LessonItem>();
}
```

#### New Endpoints
```
GET /api/lesson
Response: All lessons (standalone and course-attached)

GET /api/lesson/{id}/items
Response: Lesson with all lesson items
```

### 5. Lesson-Item Relationship Management

Support adding/removing items to/from lessons.

#### New Endpoints
```
POST /api/lesson/{lessonId}/items
Request Body: { "lessonItemIds": ["guid1", "guid2"] }
Response: Lesson with updated items

DELETE /api/lesson/{lessonId}/items/{itemId}
Response: Lesson with updated items

PUT /api/lesson/{lessonId}/items/reorder
Request Body: { "lessonItemIds": ["guid1", "guid2", "guid3"] }
Response: Lesson with reordered items
```

### 6. Standalone Lesson Items (Optional LessonId)

Allow lesson items to exist without being attached to a lesson.

#### Entity Changes (LessonItem.cs)
```csharp
public class LessonItem : Base
{
    public string Name { get; set; } = null!;
    public LessonItemType Type { get; set; }
    public string Content { get; set; } = null!;
    public Guid? LessonId { get; set; }  // MAKE NULLABLE
    public Lesson? Lesson { get; set; }
    public int Order { get; set; }
    public double DurationInSeconds { get; set; } = 0;
}
```

#### New/Updated Endpoints
```
GET /api/lessonitem
Response: All lesson items (standalone and lesson-attached)
```

### 7. Instructor Profile & Dashboard

#### New Controller: InstructorController

```csharp
[ApiController]
[Route("api/[controller]")]
public class InstructorController : TaifControllerBase
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateInstructorProfileRequest request)
    
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    
    [HttpGet("courses")]
    public async Task<IActionResult> GetMyCourses()
}
```

#### Dashboard Stats Response
```json
{
    "totalCourses": 5,
    "totalStudents": 1250,
    "totalLessons": 25,
    "totalReviews": 45,
    "averageRating": 4.7,
    "recentEnrollments": 28
}
```

---

## New DTOs Required

### Request DTOs

```csharp
// Course
public record AddLessonsToCourseRequest(List<Guid> LessonIds);
public record ReorderCourseLessonsRequest(List<Guid> LessonIds);

// Lesson
public record AddItemsToLessonRequest(List<Guid> LessonItemIds);
public record ReorderLessonItemsRequest(List<Guid> LessonItemIds);

// Instructor
public record UpdateInstructorProfileRequest(
    string? FirstName,
    string? LastName,
    string? Bio,
    string? Specialization,
    string? Avatar
);
```

### Response DTOs

```csharp
public record CourseWithDetailsResponse(
    Guid Id,
    string Name,
    string? Description,
    string? Photo,
    Guid CategoryId,
    CourseStatus Status,
    List<LessonWithItemsResponse> Lessons,
    CourseStatsResponse Stats
);

public record LessonWithItemsResponse(
    Guid Id,
    string Title,
    string? Description,
    int Order,
    List<LessonItemResponse> LessonItems
);

public record CourseStatsResponse(
    int TotalEnrollments,
    int TotalLessons,
    int TotalItems,
    double AverageRating,
    int TotalReviews,
    double CompletionRate
);

public record DashboardStatsResponse(
    int TotalCourses,
    int TotalStudents,
    int TotalLessons,
    int TotalReviews,
    double AverageRating,
    int RecentEnrollments
);
```

---

## Database Migrations Required

1. **Add CourseStatus to Course table**
   ```sql
   ALTER TABLE Courses ADD Status INT NOT NULL DEFAULT 0;
   ALTER TABLE Courses ADD InstructorId UNIQUEIDENTIFIER NULL;
   ```

2. **Make Lesson.CourseId nullable**
   ```sql
   ALTER TABLE Lessons ALTER COLUMN CourseId UNIQUEIDENTIFIER NULL;
   ```

3. **Make LessonItem.LessonId nullable**
   ```sql
   ALTER TABLE LessonItems ALTER COLUMN LessonId UNIQUEIDENTIFIER NULL;
   ```

4. **Add Description to Lesson table**
   ```sql
   ALTER TABLE Lessons ADD Description NVARCHAR(MAX) NULL;
   ```

---

## Summary of Changes

### Entities to Modify
1. `Course.cs` - Add Status, InstructorId
2. `Lesson.cs` - Make CourseId nullable, add Description
3. `LessonItem.cs` - Make LessonId nullable

### New Controller
1. `InstructorController.cs` - Profile and dashboard endpoints

### Existing Controllers to Update
1. `CourseController.cs` - Add publish/unpublish/archive, lesson management
2. `LessonController.cs` - Add item management, standalone support
3. `LessonItemController.cs` - Add standalone support

### New Services Required
1. `IInstructorService` / `InstructorService`

### Services to Update
1. `ICourseService` - Add lesson management methods
2. `ILessonService` - Add item management methods

---

## API Endpoint Summary

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| GET | `/api/instructor/profile` | Get instructor profile | High |
| GET | `/api/instructor/dashboard/stats` | Get dashboard stats | High |
| PUT | `/api/course/{id}/publish` | Publish course | High |
| PUT | `/api/course/{id}/unpublish` | Unpublish course | High |
| PUT | `/api/course/{id}/archive` | Archive course | Medium |
| GET | `/api/course/{id}/details` | Get course with full details | High |
| POST | `/api/course/{id}/lessons` | Add lessons to course | High |
| DELETE | `/api/course/{id}/lessons/{lessonId}` | Remove lesson from course | High |
| PUT | `/api/course/{id}/lessons/reorder` | Reorder course lessons | High |
| GET | `/api/lesson` | Get all lessons | High |
| GET | `/api/lesson/{id}/items` | Get lesson with items | High |
| POST | `/api/lesson/{id}/items` | Add items to lesson | High |
| DELETE | `/api/lesson/{id}/items/{itemId}` | Remove item from lesson | High |
| PUT | `/api/lesson/{id}/items/reorder` | Reorder lesson items | High |
| GET | `/api/lessonitem` | Get all lesson items | High |
