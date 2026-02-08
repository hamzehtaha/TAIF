# Instructor Portal - Architecture & Design Document

## Phase 1: Frontend-Only Implementation

---

## 1. Overview

The Instructor Portal is a dedicated module within TaifPortal that enables instructors to create, manage, and monitor their courses. This document outlines the UX flows, architecture decisions, component structure, and integration strategy.

### Key Principles
- **Isolation**: Completely separate from Student/Parent flows
- **Consistency**: Follows existing TaifPortal design system
- **Integration-Ready**: Structured for easy Phase 2 API integration
- **Instructor-First UX**: Optimized for content creation experience

---

## 2. Route Map

```
/instructor
├── /                          → Dashboard (overview, stats, activity)
├── /profile                   → Instructor profile management
├── /courses                   → Course list & management
│   ├── /new                   → Create new course (wizard)
│   └── /[courseId]            → Course detail & edit
│       ├── /                  → Course overview & settings
│       ├── /lessons           → Manage lessons
│       └── /reviews           → View course reviews
├── /lessons                   → All lessons (cross-course view)
│   └── /[lessonId]            → Lesson detail & edit
│       └── /items             → Manage lesson items
└── /lesson-items              → All lesson items (reference view)
```

---

## 3. Entity Hierarchy

```
Course
├── id, title, description, thumbnail, categoryId
├── status (draft | published | archived)
├── metadata (createdAt, updatedAt)
└── Lessons[] (ordered)
    ├── id, title, description, order
    └── LessonItems[] (ordered)
        ├── Video
        │   └── url, duration, thumbnail
        ├── RichContent
        │   └── htmlContent
        └── Assessment (Questions)
            └── Questions[]
                ├── text, type
                └── Answers[]
                    └── text, isCorrect
```

---

## 4. State Management Strategy

### Local State Architecture
```
InstructorContext (React Context)
├── instructor: InstructorProfile
├── courses: Course[]
├── currentCourse: Course | null
├── currentLesson: Lesson | null
├── unsavedChanges: boolean
├── actions:
│   ├── Course CRUD
│   ├── Lesson CRUD
│   ├── LessonItem CRUD
│   └── Reordering
```

### Data Flow
1. **Mock Service Layer**: Simulates API calls with local storage
2. **Context Provider**: Centralized state for instructor data
3. **Component State**: UI-specific state (forms, modals, drag state)

### Future API Integration Points
```typescript
// Mock service pattern - easily replaceable
interface ICourseService {
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course>;
  createCourse(data: CreateCourseInput): Promise<Course>;
  updateCourse(id: string, data: UpdateCourseInput): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
}

// Phase 1: MockCourseService (localStorage)
// Phase 2: ApiCourseService (real HTTP calls)
```

---

## 5. Component Structure

```
components/instructor/
├── layout/
│   ├── InstructorLayout.tsx      → Main layout wrapper
│   ├── InstructorSidebar.tsx     → Navigation sidebar
│   └── InstructorHeader.tsx      → Top header with actions
├── dashboard/
│   ├── StatCard.tsx              → Metric display cards
│   ├── RecentActivity.tsx        → Activity feed
│   └── QuickActions.tsx          → Common action shortcuts
├── courses/
│   ├── CourseList.tsx            → Course grid/list view
│   ├── CourseCard.tsx            → Individual course card
│   ├── CourseForm.tsx            → Create/edit form
│   ├── CourseWizard.tsx          → Step-by-step creation
│   └── CourseStatusBadge.tsx     → Draft/Published badge
├── lessons/
│   ├── LessonList.tsx            → Sortable lesson list
│   ├── LessonCard.tsx            → Draggable lesson card
│   ├── LessonForm.tsx            → Create/edit form
│   └── LessonReorder.tsx         → Drag & drop container
├── lesson-items/
│   ├── LessonItemList.tsx        → Sortable items list
│   ├── LessonItemCard.tsx        → Type-specific card
│   ├── VideoItem.tsx             → Video configuration
│   ├── RichContentItem.tsx       → Rich text editor
│   ├── AssessmentItem.tsx        → Questions builder
│   └── ItemTypeSelector.tsx      → Item type picker
├── questions/
│   ├── QuestionBuilder.tsx       → Question creation UI
│   ├── QuestionCard.tsx          → Single question display
│   ├── AnswerOption.tsx          → Answer input with correct toggle
│   └── QuestionValidation.tsx    → Validation feedback
├── reviews/
│   ├── ReviewList.tsx            → Reviews display
│   ├── ReviewCard.tsx            → Individual review
│   ├── RatingStats.tsx           → Rating breakdown
│   └── StarRating.tsx            → Star display component
└── shared/
    ├── EmptyState.tsx            → Empty state with hints
    ├── SaveIndicator.tsx         → Unsaved changes indicator
    ├── ConfirmDialog.tsx         → Confirmation modal
    └── DragHandle.tsx            → Drag indicator icon
```

---

## 6. UX Flow: Course Creation

### Step-by-Step Wizard Flow

```
Step 1: Basic Info
├── Course title (required)
├── Description (rich text)
├── Category selection
└── Thumbnail upload (placeholder)

Step 2: Add Lessons
├── Create lessons inline
├── Drag to reorder
├── Edit/delete actions
└── Minimum 1 lesson prompt

Step 3: Add Lesson Items
├── Select lesson
├── Add items (Video/Content/Quiz)
├── Configure each item
└── Drag to reorder

Step 4: Review & Publish
├── Preview course structure
├── Validation summary
├── Save as Draft / Publish
```

### Inline Editing Experience
- Click-to-edit fields
- Auto-save indicators
- Undo/redo support (future)
- Keyboard shortcuts

---

## 7. UX Decisions & Justifications

### 7.1 Sidebar Navigation
**Decision**: Fixed left sidebar with collapsible state
**Justification**: Instructors need quick access to all sections. Matches existing TaifPortal patterns. Desktop-first approach for content creation.

### 7.2 Course Creation Wizard
**Decision**: Multi-step wizard with progress indicator
**Justification**: Reduces cognitive load. Guides instructors through complete setup. Prevents incomplete courses.

### 7.3 Drag & Drop Ordering
**Decision**: Visual drag handles with drop zones
**Justification**: Intuitive reordering. Immediate visual feedback. Touch-friendly for tablet users.

### 7.4 Inline Editing
**Decision**: Click-to-edit with auto-save
**Justification**: Faster editing workflow. No page navigation needed. Modern content management UX.

### 7.5 Empty States
**Decision**: Helpful hints with action buttons
**Justification**: Guides new instructors. Reduces confusion. Encourages content creation.

### 7.6 Unsaved Changes Indicator
**Decision**: Visible indicator with save/discard options
**Justification**: Prevents data loss. Clear state communication. Builds trust.

---

## 8. Mock Data Models

### Instructor
```typescript
interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
}
```

### Course (Extended)
```typescript
interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  categoryName: string;
  status: 'draft' | 'published' | 'archived';
  instructorId: string;
  lessons: InstructorLesson[];
  stats: {
    totalStudents: number;
    totalLessons: number;
    totalItems: number;
    averageRating: number;
    reviewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Lesson
```typescript
interface InstructorLesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  items: InstructorLessonItem[];
  createdAt: string;
  updatedAt: string;
}
```

### Lesson Item
```typescript
type LessonItemType = 'video' | 'rich-content' | 'assessment';

interface BaseLessonItem {
  id: string;
  title: string;
  type: LessonItemType;
  order: number;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoLessonItem extends BaseLessonItem {
  type: 'video';
  videoUrl: string;
  duration?: number;
  thumbnailUrl?: string;
}

interface RichContentLessonItem extends BaseLessonItem {
  type: 'rich-content';
  htmlContent: string;
}

interface AssessmentLessonItem extends BaseLessonItem {
  type: 'assessment';
  questions: Question[];
  passingScore?: number;
}

type InstructorLessonItem = VideoLessonItem | RichContentLessonItem | AssessmentLessonItem;
```

### Question & Answer
```typescript
interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  order: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}
```

### Review
```typescript
interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
```

---

## 9. Integration Readiness Checklist

### Phase 2 API Integration Points

- [ ] `GET /api/instructor/profile` - Get instructor profile
- [ ] `PUT /api/instructor/profile` - Update profile
- [ ] `GET /api/instructor/courses` - List instructor's courses
- [ ] `POST /api/instructor/courses` - Create course
- [ ] `PUT /api/instructor/courses/:id` - Update course
- [ ] `DELETE /api/instructor/courses/:id` - Delete course
- [ ] `POST /api/instructor/courses/:id/lessons` - Add lesson
- [ ] `PUT /api/instructor/lessons/:id` - Update lesson
- [ ] `DELETE /api/instructor/lessons/:id` - Delete lesson
- [ ] `PUT /api/instructor/lessons/reorder` - Reorder lessons
- [ ] `POST /api/instructor/lessons/:id/items` - Add lesson item
- [ ] `PUT /api/instructor/items/:id` - Update item
- [ ] `DELETE /api/instructor/items/:id` - Delete item
- [ ] `PUT /api/instructor/items/reorder` - Reorder items
- [ ] `GET /api/instructor/courses/:id/reviews` - Get reviews
- [ ] `GET /api/instructor/stats` - Dashboard statistics

### Code Markers
All mock implementations include `// TODO: API Integration` comments for easy Phase 2 migration.

---

## 10. Technology Stack (Aligned with TaifPortal)

- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit (to be added)
- **Rich Text**: TipTap or similar (to be added)
- **State**: React Context + useReducer
- **Charts**: Recharts (existing)

---

## 11. File Structure

```
app/instructor/
├── layout.tsx                    → Instructor layout
├── page.tsx                      → Dashboard
├── loading.tsx                   → Loading state
├── profile/
│   └── page.tsx                  → Profile management
├── courses/
│   ├── page.tsx                  → Course list
│   ├── new/
│   │   └── page.tsx              → Course wizard
│   └── [courseId]/
│       ├── page.tsx              → Course detail
│       ├── lessons/
│       │   └── page.tsx          → Lesson management
│       └── reviews/
│           └── page.tsx          → Course reviews
├── lessons/
│   ├── page.tsx                  → All lessons view
│   └── [lessonId]/
│       ├── page.tsx              → Lesson detail
│       └── items/
│           └── page.tsx          → Lesson items
└── lesson-items/
    └── page.tsx                  → All items view

contexts/
└── InstructorContext.tsx         → Instructor state management

services/instructor/
├── mockInstructorService.ts      → Mock instructor data
├── mockCourseService.ts          → Mock course CRUD
├── mockLessonService.ts          → Mock lesson CRUD
├── mockLessonItemService.ts      → Mock item CRUD
└── mockReviewService.ts          → Mock reviews data

types/instructor/
└── index.ts                      → TypeScript interfaces

hooks/instructor/
├── useInstructor.ts              → Instructor context hook
├── useCourseEditor.ts            → Course editing logic
└── useDragReorder.ts             → Drag & drop logic
```

---

---

## 12. Implementation Summary

### Files Created

```
app/instructor/
├── layout.tsx                    ✅ Created
├── loading.tsx                   ✅ Created
├── page.tsx                      ✅ Created (Dashboard)
├── profile/
│   └── page.tsx                  ✅ Created
├── courses/
│   ├── page.tsx                  ✅ Created (Course list)
│   ├── new/
│   │   └── page.tsx              ✅ Created (Course wizard)
│   └── [courseId]/
│       ├── page.tsx              ✅ Created (Course detail)
│       ├── lessons/
│       │   └── page.tsx          ✅ Created (Lesson management)
│       └── reviews/
│           └── page.tsx          ✅ Created (Reviews view)
├── lessons/
│   └── page.tsx                  ✅ Created (All lessons view)
└── lesson-items/
    └── page.tsx                  ✅ Created (All items view)

components/instructor/
├── index.ts                      ✅ Created
├── layout/
│   ├── index.ts                  ✅ Created
│   ├── InstructorLayout.tsx      ✅ Created
│   ├── InstructorSidebar.tsx     ✅ Created
│   └── InstructorHeader.tsx      ✅ Created
└── shared/
    ├── index.ts                  ✅ Created
    ├── EmptyState.tsx            ✅ Created
    └── SaveIndicator.tsx         ✅ Created

contexts/
└── InstructorContext.tsx         ✅ Created

services/instructor/
├── mockData.ts                   ✅ Created
└── mockInstructorService.ts      ✅ Created

types/instructor/
└── index.ts                      ✅ Created
```

### Key Features Implemented

1. **Instructor Dashboard**
   - Stats cards (courses, students, ratings, completion)
   - Recent courses with progress indicators
   - Activity feed with timestamps
   - Quick action buttons

2. **Course Management**
   - Grid/list view toggle
   - Search and filter by status
   - Create course wizard (3 steps)
   - Edit course details
   - Publish/archive courses
   - Delete with confirmation

3. **Lesson Management**
   - Add/edit/delete lessons
   - Lesson list with item counts
   - Visual ordering indicators
   - Inline editing support

4. **Lesson Items**
   - Video items (URL, duration, thumbnail)
   - Rich content (HTML editor placeholder)
   - Assessments (questions with answers)
   - Collapsible item editing
   - Type-specific icons and badges

5. **Reviews & Ratings**
   - Rating distribution chart
   - Average rating display
   - Student reviews with avatars
   - Review insights metrics

6. **Profile Management**
   - Edit personal information
   - Expertise tags
   - Account stats display
   - Account settings (placeholders)

### Phase 2 Migration Guide

To integrate with real APIs in Phase 2:

1. **Replace Mock Service**
   ```typescript
   // services/instructor/instructorService.ts
   import { httpService } from '../httpService';
   
   class InstructorService {
     async getCourses(): Promise<InstructorCourse[]> {
       // TODO: Replace mock with real API
       return httpService.get('/api/instructor/courses');
     }
     // ... other methods
   }
   ```

2. **Update Context Provider**
   - Replace `mockInstructorService` imports with real service
   - Add error handling for network failures
   - Implement optimistic updates if needed

3. **Add Authentication**
   - Integrate with existing auth system
   - Add instructor role guard
   - Handle token refresh

4. **File Uploads**
   - Implement image upload for thumbnails
   - Add video upload support
   - Configure media server integration

---

*Document Version: 1.1*
*Phase: 1 (Frontend Only) - COMPLETED*
*Last Updated: 2026-02-08*
