# Data Layer Guide - Mock & Real API

## 🎯 Quick Start

### Current Setup
- ✅ **Auth APIs** (login, register, profile) → Real Backend
- ✅ **Course/Lesson APIs** → Mock Data (local JSON)

### How to Switch to Real API

**ONE LINE CHANGE:**

```typescript
// config/dataSource.ts
export const USE_MOCK_DATA = false; // Change from true to false
```

That's it! All course/lesson services will use real backend.

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Services                     │
├─────────────────────────────────────────────────────────┤
│  courseService  │  lessonService  │  lessonItemService  │
└────────┬────────┴────────┬────────┴────────┬────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                   ┌───────────────┐
                   │ DataProvider  │ ◄── Switch here
                   └───────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │  Mock Data   │          │   Real API   │
      │ (localDB.json)│          │  (Backend)   │
      └──────────────┘          └──────────────┘
              │                         │
              └────────────┬────────────┘
                           ▼
                   ┌───────────────┐
                   │    Mappers    │
                   └───────┬───────┘
                           ▼
                   ┌───────────────┐
                   │  UI Models    │
                   └───────────────┘
```

---

## 🔧 Configuration

### File: `config/dataSource.ts`

```typescript
export const USE_MOCK_DATA = true; // Toggle here

export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  mockDataPath: '/data/localDB.json',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
};
```

---

## 📦 Backend DTOs (What API Returns)

### Minimal Structure - Backend only sends:

**CourseDto**
```typescript
{
  id: string;
  name: string;
}
```

**LessonDto**
```typescript
{
  id: string;
  name: string;
}
```

**LessonItemDto**
```typescript
{
  id: string;
  name: string;
  type: "video";
}
```

---

## 🗺️ Mappers (Enrich Data for UI)

Mappers transform minimal DTOs into full UI models:

### CourseMapper
```typescript
// Backend sends: { id: "1", name: "Web Dev" }

// Mapper adds:
{
  id: "1",
  title: "Web Dev",
  description: "Learn Web Dev with...",
  instructor: "Dr. Sarah Johnson",
  duration: "8 weeks",
  level: "Beginner",
  thumbnail: "/course-1.jpg",
  rating: 4.5,
  price: 99.99,
  category: "Web Development",
  enrolledStudents: 734,
  totalLessons: 24,
  lessons: []
}
```

### When Backend Adds More Fields

Just update the mapper - **no UI changes needed**:

```typescript
// mappers/courseMapper.ts
static toUiModel(dto: CourseDto, index: number = 0): Course {
  return {
    id: dto.id,
    title: dto.name,
    // Use real value if available, fallback to generated
    description: dto.description || `Learn ${dto.name}...`,
    instructor: dto.instructor || instructors[index],
    duration: dto.duration || `${8 + (index % 5)} weeks`,
    // ... other fields
  };
}
```

---

## 🔌 Service Usage

### All services work the same way:

```typescript
// Get DTOs from backend/mock
const dtos = await DataProvider.get<CourseDto[]>(
  '/courses',
  () => httpService.get<CourseDto[]>('/api/courses')
);

// Map to UI models
const courses = CourseMapper.toUiModelList(dtos);

// Return to UI
return courses;
```

### UI Components (No Changes Needed)

```typescript
// Works with both mock and real API
const courses = await courseService.getCourses();
const lessons = await lessonService.getLessonsByCourse('1');
const items = await lessonItemService.getItemsByLesson('1', '1-1');
```

---

## 📁 File Structure

```
Taif-Portal/
├── config/
│   └── dataSource.ts          # ⚙️ SWITCH HERE
├── data/
│   └── localDB.json           # 📦 Mock data
├── dtos/                      # 📋 Backend DTOs
│   ├── course/CourseDto.ts
│   ├── lesson/LessonDto.ts
│   └── lessonItem/LessonItemDto.ts
├── mappers/                   # 🗺️ DTO → UI Model
│   ├── courseMapper.ts
│   ├── lessonMapper.ts
│   └── lessonItemMapper.ts
├── lib/
│   └── dataProvider.ts        # 🔌 Mock/API router
└── services/                  # 📚 Business logic
    ├── authService.ts         # ✅ Real API
    ├── courseService.ts       # 🔄 Mock/API
    ├── lessonService.ts       # 🔄 Mock/API
    └── lessonItemService.ts   # 🔄 Mock/API
```

---

## 🎯 Current API Status

| Service | Status | Notes |
|---------|--------|-------|
| **Auth** | ✅ Real API | login, register, profile |
| **Courses** | 🔄 Mock/Switchable | GET /api/courses |
| **Lessons** | 🔄 Mock/Switchable | GET /api/courses/{id}/lessons |
| **Lesson Items** | 🔄 Mock/Switchable | GET /api/courses/{id}/lessons/{id}/items |

---

## 🚀 Backend Requirements

When backend is ready, implement these endpoints:

```
GET    /api/courses
GET    /api/courses/enrolled
GET    /api/courses/{id}
POST   /api/courses/{id}/enroll
GET    /api/courses/{id}/lessons
GET    /api/courses/{courseId}/lessons/{lessonId}
GET    /api/courses/{courseId}/lessons/{lessonId}/items
POST   /api/courses/{courseId}/lessons/{lessonId}/complete
POST   /api/courses/{courseId}/lessons/{lessonId}/items/{itemId}/complete
```

### Response Format

All endpoints return DTOs:

```json
// GET /api/courses
[
  { "id": "1", "name": "Web Development" },
  { "id": "2", "name": "React Advanced" }
]

// GET /api/courses/1/lessons
[
  { "id": "1-1", "name": "Introduction to HTML" },
  { "id": "1-2", "name": "CSS Basics" }
]

// GET /api/courses/1/lessons/1-1/items
[
  { "id": "1-1-1", "name": "What is HTML?", "type": "video" },
  { "id": "1-1-2", "name": "HTML Structure", "type": "video" }
]
```

---

## 💡 Tips

### Development
- Keep `USE_MOCK_DATA = true` for fast development
- No backend needed
- Instant responses

### Testing Backend
- Set `USE_MOCK_DATA = false`
- Ensure backend is running on `http://localhost:5000`
- Test with real data

### Production
- Set `USE_MOCK_DATA = false`
- Point to production API
- All features work identically

### Debugging

```typescript
// Check current mode
import { DataProvider } from '@/lib/dataProvider';

if (DataProvider.isMockMode()) {
  console.log('Using mock data');
} else {
  console.log('Using real API');
}
```

---

## ✅ Benefits

1. **Clean Separation** - Backend DTOs vs UI Models
2. **Easy Switch** - One line configuration change
3. **No Breaking Changes** - UI always gets full models
4. **Type Safe** - TypeScript catches errors
5. **Flexible** - Easy to extend when backend adds fields

---

## 📝 Summary

- **Auth APIs** → Already using real backend ✅
- **Course/Lesson APIs** → Currently using mock data 🔄
- **Switch** → Change `USE_MOCK_DATA` in `config/dataSource.ts`
- **Mappers** → Automatically enrich minimal DTOs to full UI models
- **No UI Changes** → Components always get complete data

**Questions?** Check the mapper files for implementation details!
