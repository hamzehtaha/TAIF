# Mock Data System - Quick Start Guide

## 🎯 Overview

The application uses a **smart data layer** that can switch between **Mock Data** (local JSON) and **Real API** with a single configuration change.

## 🔄 How to Switch Between Mock and Real API

### Current Mode: **MOCK DATA** ✅

To switch to **REAL API** when backend is ready:

1. Open `config/dataSource.ts`
2. Change `USE_MOCK_DATA` from `true` to `false`

```typescript
// config/dataSource.ts
export const USE_MOCK_DATA = false; // Changed from true to false
```

That's it! All services will automatically use real API endpoints.

## 📁 File Structure

```
Taif-Portal/
├── config/
│   └── dataSource.ts          # ⚙️ MAIN SWITCH - Toggle mock/API here
├── data/
│   └── localDB.json           # 📦 Mock data (courses, lessons, items)
├── lib/
│   └── dataProvider.ts        # 🔌 Data access layer
└── services/
    ├── courseService.ts       # 📚 Course operations
    ├── lessonService.ts       # 📖 Lesson operations
    └── lessonItemService.ts   # 📝 Lesson item operations
```

## 📊 Available Mock Data

### Courses (5 courses)
- Introduction to Web Development
- Advanced React & Next.js
- Data Science with Python
- Mobile App Development with React Native
- UI/UX Design Fundamentals

### Lessons (9 lessons across courses)
- HTML, CSS, JavaScript lessons
- React Hooks, Next.js lessons
- Design principles lessons

### Lesson Items (10 items)
- Videos
- Reading materials
- Quizzes
- Assignments

## 🛠️ Services Available

### 1. Course Service

```typescript
import { courseService } from '@/services/courseService';

// Get all courses
const courses = await courseService.getCourses();

// Get enrolled courses
const enrolled = await courseService.getEnrolledCourses();

// Get specific course
const course = await courseService.getCourseById('1');

// Enroll in course
await courseService.enrollInCourse('1');

// Get course progress
const progress = await courseService.getCourseProgress('1');
```

### 2. Lesson Service

```typescript
import { lessonService } from '@/services/lessonService';

// Get lessons for a course
const lessons = await lessonService.getLessonsByCourse('1');

// Get specific lesson
const lesson = await lessonService.getLessonById('1', '1-1');

// Mark lesson complete
await lessonService.markLessonComplete('1', '1-1');

// Get lesson progress
const progress = await lessonService.getLessonProgress('1', '1-1');
```

### 3. Lesson Item Service

```typescript
import { lessonItemService } from '@/services/lessonItemService';

// Get items for a lesson
const items = await lessonItemService.getItemsByLesson('1', '1-1');

// Get specific item
const item = await lessonItemService.getItemById('1', '1-1', '1-1-1');

// Mark item complete
await lessonItemService.markItemComplete('1', '1-1', '1-1-1');

// Submit quiz
const result = await lessonItemService.submitQuiz('1', '1-1', '1-1-4', {
  q1: 0 // answer index
});

// Submit assignment
await lessonItemService.submitAssignment('1', '1-1', '1-1-5', {
  content: 'My assignment submission'
});

// Navigate items
const nextItem = await lessonItemService.getNextItem('1', '1-1', '1-1-1');
const prevItem = await lessonItemService.getPreviousItem('1', '1-1', '1-1-2');
```

## 🔌 How It Works

### DataProvider Pattern

All services use the `DataProvider` which handles the mock/API switch:

```typescript
// In any service
return DataProvider.get<Course[]>(
  '/courses',                                    // Mock endpoint pattern
  () => httpService.get<Course[]>('/api/courses') // Real API call
);
```

**When `USE_MOCK_DATA = true`:**
- Returns data from `localDB.json`
- No network calls made
- Instant response

**When `USE_MOCK_DATA = false`:**
- Calls real API via `httpService`
- Uses authentication tokens
- Returns real backend data

## 📝 API Endpoint Mapping

| Service Method | Mock Pattern | Real API Endpoint |
|----------------|--------------|-------------------|
| `getCourses()` | `/courses` | `/api/courses` |
| `getEnrolledCourses()` | `/courses/enrolled` | `/api/courses/enrolled` |
| `getCourseById(id)` | `/courses/{id}` | `/api/courses/{id}` |
| `getLessonsByCourse(courseId)` | `/courses/{courseId}/lessons` | `/api/courses/{courseId}/lessons` |
| `getItemsByLesson(courseId, lessonId)` | `/courses/{courseId}/lessons/{lessonId}/items` | `/api/courses/{courseId}/lessons/{lessonId}/items` |

## 🎨 Customizing Mock Data

Edit `data/localDB.json` to add/modify:

```json
{
  "courses": [...],
  "lessons": [...],
  "lessonItems": [...]
}
```

The `DataProvider` automatically filters and returns the correct data based on the endpoint pattern.

## ✅ Testing Checklist

### With Mock Data (Current)
- [x] Dashboard shows enrolled courses
- [x] Course list displays all courses
- [x] Course details page works
- [x] Lessons display for each course
- [x] Lesson items (videos, quizzes, etc.) work
- [x] Progress tracking works

### When Switching to Real API
1. Set `USE_MOCK_DATA = false`
2. Ensure backend is running on `http://localhost:5000`
3. Test same features above
4. All should work identically

## 🚀 Backend API Requirements

When backend is ready, ensure these endpoints exist:

### Required Endpoints

```
GET    /api/courses
GET    /api/courses/enrolled
GET    /api/courses/{id}
POST   /api/courses/{id}/enroll
GET    /api/courses/{id}/progress
GET    /api/courses/{courseId}/lessons
GET    /api/courses/{courseId}/lessons/{lessonId}
POST   /api/courses/{courseId}/lessons/{lessonId}/complete
GET    /api/courses/{courseId}/lessons/{lessonId}/items
GET    /api/courses/{courseId}/lessons/{lessonId}/items/{itemId}
POST   /api/courses/{courseId}/lessons/{lessonId}/items/{itemId}/complete
POST   /api/courses/{courseId}/lessons/{lessonId}/items/{itemId}/submit
```

### Response Formats

All responses should match the TypeScript interfaces in the services:
- `Course` interface in `courseService.ts`
- `Lesson` interface in `lessonService.ts`
- `LessonItem` interface in `lessonItemService.ts`

## 💡 Tips

1. **Development**: Keep `USE_MOCK_DATA = true` for fast development
2. **Testing**: Switch to `false` to test real API integration
3. **Production**: Set to `false` for production deployment
4. **Debugging**: Check console for `[MOCK]` logs when using mock data

## 🔍 Checking Current Mode

```typescript
import { DataProvider } from '@/lib/dataProvider';

if (DataProvider.isMockMode()) {
  console.log('Using mock data');
} else {
  console.log('Using real API');
}
```

---

**Questions?** Check the code comments in:
- `config/dataSource.ts` - Main configuration
- `lib/dataProvider.ts` - Data access logic
- Individual service files - Usage examples
