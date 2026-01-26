# DTO and Mapping Layer Guide

## 🎯 Architecture Overview

The application uses a **3-layer architecture** for data handling:

```
Backend API (DTOs) → Mapping Layer → UI Models
```

### Why This Approach?

1. **Backend sends minimal data** (only `id` and `name`)
2. **Mappers enrich data** with UI-needed fields
3. **Easy to extend** when backend adds more fields
4. **Type-safe** with TypeScript interfaces

## 📦 Structure

```
Taif-Portal/
├── dtos/                    # Backend DTOs (what API returns)
│   ├── course/
│   │   └── CourseDto.ts     # { id, name }
│   ├── lesson/
│   │   └── LessonDto.ts     # { id, name }
│   └── lessonItem/
│       └── LessonItemDto.ts # { id, name, type }
├── mappers/                 # Transform DTOs → UI Models
│   ├── courseMapper.ts
│   ├── lessonMapper.ts
│   └── lessonItemMapper.ts
└── services/                # Use DTOs + Mappers
    ├── courseService.ts
    ├── lessonService.ts
    └── lessonItemService.ts
```

## 🔄 Data Flow

### Example: Getting Courses

```typescript
// 1. Backend returns minimal DTO
{
  id: "1",
  name: "Introduction to Web Development"
}

// 2. Mapper enriches to UI Model
{
  id: "1",
  title: "Introduction to Web Development",
  description: "Learn Introduction to Web Development...",
  instructor: "Dr. Sarah Johnson",
  duration: "8 weeks",
  level: "Beginner",
  thumbnail: "/course-1.jpg",
  enrolledStudents: 734,
  rating: 4.5,
  price: 99.99,
  category: "Web Development",
  // ... more UI fields
}
```

## 📋 DTOs (Backend Structure)

### CourseDto
```typescript
interface CourseDto {
  id: string;
  name: string;
}
```

### LessonDto
```typescript
interface LessonDto {
  id: string;
  name: string;
}
```

### LessonItemDto
```typescript
interface LessonItemDto {
  id: string;
  name: string;
  type: "video"; // Always video for now
}
```

## 🗺️ Mappers

### CourseMapper

```typescript
import { CourseMapper } from '@/mappers/courseMapper';

// Single course
const course = CourseMapper.toUiModel(dto, index);

// Multiple courses
const courses = CourseMapper.toUiModelList(dtos);

// Back to DTO (for API calls)
const dto = CourseMapper.toDto(course);
```

**What it adds:**
- `description` - Generated from name
- `instructor` - Rotates through instructor list
- `duration` - Calculated based on id
- `level` - Beginner/Intermediate/Advanced
- `thumbnail` - Course image path
- `enrolledStudents` - Generated number
- `rating` - 4.5-5.0 range
- `price` - Calculated based on id
- `category` - Web Dev, Data Science, etc.
- `totalLessons` - Generated count
- `completedLessons` - Default 0

### LessonMapper

```typescript
import { LessonMapper } from '@/mappers/lessonMapper';

// Single lesson
const lesson = LessonMapper.toUiModel(dto, courseId, index);

// Multiple lessons
const lessons = LessonMapper.toUiModelList(dtos, courseId);
```

**What it adds:**
- `courseId` - Parent course reference
- `description` - Generated from name
- `duration` - 30-80 minutes
- `order` - Sequential ordering
- `isCompleted` - Default false
- `videoUrl` - Video file path
- `totalItems` - 5-10 items per lesson

### LessonItemMapper

```typescript
import { LessonItemMapper } from '@/mappers/lessonItemMapper';

// Single item
const item = LessonItemMapper.toUiModel(dto, lessonId, courseId, index);

// Multiple items
const items = LessonItemMapper.toUiModelList(dtos, lessonId, courseId);
```

**What it adds:**
- `lessonId` - Parent lesson reference
- `courseId` - Parent course reference
- `content` - Video file path
- `duration` - 10-30 minutes
- `order` - Sequential ordering
- `isCompleted` - Default false

## 🔧 Service Usage

### CourseService

```typescript
// Services automatically use DTOs and mappers
const courses = await courseService.getCourses();
// Returns: Course[] (full UI models)

const course = await courseService.getCourseById('1');
// Returns: Course (full UI model)
```

**Behind the scenes:**
```typescript
// 1. Get DTO from backend
const dtos = await DataProvider.get<CourseDto[]>(...);

// 2. Map to UI models
const courses = CourseMapper.toUiModelList(dtos);

// 3. Return enriched data
return courses;
```

### LessonService

```typescript
const lessons = await lessonService.getLessonsByCourse('1');
// Returns: Lesson[] (full UI models)
```

### LessonItemService

```typescript
const items = await lessonItemService.getItemsByLesson('1', '1-1');
// Returns: LessonItem[] (full UI models)
```

## 🎨 Customizing Mappers

### Adding New Fields

When backend adds a new field:

```typescript
// 1. Update DTO
interface CourseDto {
  id: string;
  name: string;
  price?: number; // New field from backend
}

// 2. Update Mapper
static toUiModel(dto: CourseDto, index: number = 0): Course {
  return {
    id: dto.id,
    title: dto.name,
    price: dto.price || (99.99 + (index * 20)), // Use backend value or fallback
    // ... other fields
  };
}
```

### Changing Default Values

Edit the mapper to change generated values:

```typescript
// courseMapper.ts
const instructors = [
  "Your Instructor 1",
  "Your Instructor 2",
  // ... add more
];

const categories = [
  "Your Category 1",
  "Your Category 2",
  // ... add more
];
```

## ✅ Benefits

1. **Clean Separation**
   - Backend: Minimal DTOs
   - Mappers: Data enrichment
   - UI: Full models

2. **Easy Migration**
   - Backend adds fields → Update mapper
   - No UI component changes needed

3. **Type Safety**
   - DTOs match backend exactly
   - UI models have all needed fields
   - TypeScript catches mismatches

4. **Testability**
   - Test mappers independently
   - Mock DTOs easily
   - Verify transformations

5. **Flexibility**
   - Change generated values anytime
   - Add computed fields
   - Handle missing data gracefully

## 🚀 When Backend is Ready

### Scenario 1: Backend adds more fields

```typescript
// Backend now returns:
interface CourseDto {
  id: string;
  name: string;
  description: string;  // NEW
  instructor: string;   // NEW
  duration: string;     // NEW
}

// Update mapper to use real data:
static toUiModel(dto: CourseDto, index: number = 0): Course {
  return {
    id: dto.id,
    title: dto.name,
    description: dto.description,        // Use real value
    instructor: dto.instructor,          // Use real value
    duration: dto.duration,              // Use real value
    // Keep generated values for fields backend doesn't have yet
    thumbnail: `/course-${(index % 5) + 1}.jpg`,
    rating: 4.5 + (index % 5) * 0.1,
    // ...
  };
}
```

### Scenario 2: All fields from backend

```typescript
// When backend provides everything, mapper becomes simple:
static toUiModel(dto: CourseDto): Course {
  return {
    id: dto.id,
    title: dto.name,
    description: dto.description,
    instructor: dto.instructor,
    duration: dto.duration,
    level: dto.level,
    thumbnail: dto.thumbnail,
    enrolledStudents: dto.enrolledStudents,
    rating: dto.rating,
    price: dto.price,
    category: dto.category,
    // ... all from backend
  };
}
```

## 📝 Best Practices

1. **Always use mappers** - Never use DTOs directly in UI
2. **Keep DTOs minimal** - Only what backend actually returns
3. **Document generated fields** - Comment which fields are enriched
4. **Consistent generation** - Use id-based logic for consistency
5. **Fallback values** - Always provide defaults for optional fields

## 🔍 Debugging

### Check what backend returns:

```typescript
// In DataProvider
console.log('[DTO]', dto); // See raw backend data
```

### Check mapped data:

```typescript
// In Mapper
console.log('[UI Model]', uiModel); // See enriched data
```

### Verify mapping:

```typescript
const dto = { id: '1', name: 'Test Course' };
const mapped = CourseMapper.toUiModel(dto);
console.log(mapped);
// Should have all UI fields filled
```

## 📚 Summary

- **DTOs** = What backend sends (minimal)
- **Mappers** = Transform DTOs to UI models (enrichment)
- **Services** = Use DTOs + Mappers automatically
- **UI Components** = Receive full UI models

This architecture ensures:
- ✅ Clean code separation
- ✅ Easy backend integration
- ✅ Type safety
- ✅ Flexibility for changes
- ✅ No breaking changes when backend evolves

---

**Questions?** Check the mapper files for implementation details!
