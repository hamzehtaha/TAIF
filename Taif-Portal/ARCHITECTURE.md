# TAIF Portal Frontend Architecture

## Overview

The TAIF Portal is a Next.js-based learning management system frontend that integrates with the TAIF ServerAPI backend. This document describes the architecture, data flow, key design decisions, learning flow logic, and component structure.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Data Flow](#data-flow)
3. [Learning Flow](#learning-flow)
4. [Resume Learning Logic](#resume-learning-logic)
5. [Component Breakdown](#component-breakdown)
6. [SSR Strategy](#ssr-strategy)
7. [UX Decisions](#ux-decisions)
8. [API Integration](#api-integration)

## Project Structure

```
Taif-Portal/
├── app/                      # Next.js App Router pages
│   ├── dashboard/            # Protected dashboard pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── courses/          # Course-related pages
│   │   │   ├── page.tsx      # Courses list
│   │   │   └── [id]/         # Course details
│   │   │       ├── page.tsx  # Course detail page
│   │   │       └── lesson/   # Lesson pages
│   │   │           └── [lessonId]/page.tsx
│   │   └── settings/         # User settings
│   ├── login/                # Login page
│   └── signup/               # Registration page
├── components/               # Reusable UI components
│   ├── layout/               # Layout components
│   ├── ui/                   # Base UI components (shadcn/ui)
│   └── CourseCard.tsx        # Course card component
├── config/                   # Configuration files
│   └── dataSource.ts         # API configuration
├── dtos/                     # Data Transfer Objects
│   ├── auth/                 # Authentication DTOs
│   ├── category/             # Category DTOs
│   ├── course/               # Course DTOs
│   ├── enrollment/           # Enrollment DTOs
│   ├── lesson/               # Lesson DTOs
│   ├── lessonItem/           # Lesson item DTOs
│   ├── lessonItemProgress/   # Progress tracking DTOs
│   └── user/                 # User DTOs
├── hooks/                    # Custom React hooks
├── lib/                      # Utility libraries
├── services/                 # API service layer
│   ├── authService.ts        # Authentication
│   ├── categoryService.ts    # Categories
│   ├── courseService.ts      # Courses
│   ├── enrollmentService.ts  # Enrollments & Favorites
│   ├── httpService.ts        # HTTP client with token handling
│   ├── lessonService.ts      # Lessons
│   ├── lessonItemService.ts  # Lesson items
│   └── lessonItemProgressService.ts  # Completion tracking
└── translations/             # i18n translations
```

## Data Flow

### Authentication Flow

```
1. User submits login/register form
2. authService calls POST /api/auth/login or /api/auth/register
3. Tokens (access + refresh) stored in localStorage
4. User profile fetched via GET /api/auth/me
5. User data stored in localStorage for quick access
6. httpService automatically attaches Authorization header to requests
7. On 401 response, httpService attempts token refresh
```

### Course & Learning Flow

```
1. Dashboard loads enrolled courses via GET /api/enrollments/user
2. Courses list fetches all courses via GET /api/Course
3. Categories fetched via GET /api/Category for filtering
4. Course details page:
   - Fetches course via GET /api/Course/{id}
   - Fetches lessons via GET /api/Lesson/course/{courseId}
   - Checks enrollment status via enrollment service
5. Enrollment via POST /api/enrollments
6. Favorites toggled via PUT /api/enrollments/toggleFavourite
7. Lesson page:
   - Fetches lesson items with progress via GET /api/LessonItem/lessonProgress/{lessonId}
   - Marks completion via POST /api/LessonItemProgress
```

## Learning Flow

### Overview
The learning flow is the core user journey for consuming course content. It follows this structure:

```
Course → Lessons → Lesson Items (Video/Text/Question)
```

### Learning Flow Rules

1. **Auto-Complete on View**: When a user opens any lesson item, it is **automatically marked as completed** via the API. There is no manual "Mark as Complete" button.

2. **Immediate Status Reflection**: Completion status updates immediately in:
   - The lesson items sidebar (green checkmark)
   - The lesson progress indicator
   - The course progress (when returning to course details)

3. **Item Types Supported**:
   - **Video**: Displays video player or placeholder
   - **Text**: Displays text content
   - **Question**: Placeholder for quiz functionality (not implemented)

### Learning Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Back | Navigation Controls | Exit                  │
├─────────────────────────────────────┬───────────────────────┤
│                                     │                       │
│  Video/Content Area                 │  Sidebar              │
│  (Fixed, non-scrollable)            │  (Scrollable)         │
│                                     │                       │
│                                     │  - Progress bar       │
├─────────────────────────────────────┤  - Lesson items list  │
│                                     │    ✓ Completed items  │
│  Item Details & Navigation          │    ● Active item      │
│  (Scrollable content area)          │    ○ Pending items    │
│                                     │                       │
└─────────────────────────────────────┴───────────────────────┘
```

**Key Layout Features**:
- Video section is fixed at top, never scrolls
- Sidebar is independently scrollable
- Clear visual hierarchy between active/completed/pending items
- Mobile: Sidebar toggles as overlay

## Resume Learning Logic

### Using `lastLessonItemId`

The enrollment record includes a `lastLessonItemId` field that tracks the user's last viewed lesson item.

### Resume Flow

```typescript
// Course Details Page - getResumeLearningUrl()
1. Check if enrollment.lastLessonItemId exists
2. If yes:
   - Find which lesson contains this item
   - Navigate to: /courses/{courseId}/lesson/{lessonId}?item={lastLessonItemId}
3. If no:
   - Navigate to first lesson's first item
   - URL: /courses/{courseId}/lesson/{firstLessonId}?item={firstItemId}
```

### Learning Page Initialization

```typescript
// Lesson Page - on load
1. Check URL for ?item={itemId} parameter
2. If present:
   - Find item index in lessonItems array
   - Set currentItemIndex to that index
3. If not present:
   - Find first incomplete item
   - If all complete, start from index 0
```

### Button Text Logic

```typescript
// Course Details Page
if (enrollment.lastLessonItemId) {
  buttonText = "Continue Learning"  // Has progress
} else {
  buttonText = "Start Learning"     // New enrollment
}
```

## Component Breakdown

### Learning Components (`/components/learning/`)

| Component | Purpose | Props |
|-----------|---------|-------|
| `LessonList` | Displays lessons with nested items | `lessons`, `expandedLessonId`, `onLessonToggle`, `onItemClick`, `isEnrolled` |
| `LessonItemRow` | Single lesson item row | `item`, `isActive`, `onClick`, `disabled` |
| `VideoPlayerSection` | Video display area | `item`, `isPlaying`, `onPlayToggle` |
| `LearningSidebar` | Lesson items sidebar | `title`, `items`, `currentItemId`, `onItemClick`, `isOpen`, `onClose` |
| `ProgressIndicator` | Progress bar | `completed`, `total`, `showLabel`, `size` |
| `CategoryFilter` | Category pill filters | `categories`, `selectedCategoryId`, `onCategorySelect` |

### Component Hierarchy

```
CourseDetailsPage
├── LessonList
│   └── LessonItemRow (multiple)
└── CourseCard (in sidebar)

LessonPage
├── VideoPlayerSection
├── Item Details (inline)
└── Sidebar
    ├── ProgressIndicator
    └── LessonItemRow (multiple)

CoursesListPage
├── CategoryFilter
└── CourseCard (grid)
```

### Single Responsibility

Each component handles one concern:
- `LessonItemRow`: Renders a single item with status icon
- `ProgressIndicator`: Only shows progress bar/text
- `CategoryFilter`: Only handles category selection UI
- `VideoPlayerSection`: Only handles video display

## SSR Strategy

### Current Approach

Due to authentication via `localStorage`, full SSR is limited for authenticated pages:

| Page | Rendering | Reason |
|------|-----------|--------|
| Home (`/`) | Client | Categories load client-side, favorites need auth |
| Login/Signup | Client | Form interactions |
| Dashboard | Client | Requires auth token |
| Courses List | Client | Requires auth for enrollment status |
| Course Details | Client | Requires auth for enrollment |
| Learning Page | Client | Requires auth, real-time progress |

### SSR Opportunities

For future enhancement with cookie-based auth:
- **Home Page**: Categories could be SSR
- **Course Details (public view)**: Course info could be SSR
- **Static pages**: About, Help could be fully SSR

### Current Optimization

Even without SSR, pages are optimized with:
- Parallel data fetching (`Promise.all`)
- Skeleton loaders for perceived performance
- Minimal re-renders via proper state management

## UX Decisions

### 1. Auto-Complete Philosophy
**Decision**: Items auto-complete on view
**Rationale**: Reduces friction, assumes viewing = learning. No extra clicks required.

### 2. Category Navigation
**Decision**: Categories on home navigate to filtered courses list
**Rationale**: Categories are discovery-oriented; users expect to see course listings.

### 3. Favorites Visibility
**Decision**: Favorites section only shows for authenticated users
**Rationale**: Unauthenticated users can't have favorites.

### 4. Resume vs Start
**Decision**: Dynamic button text based on progress
**Rationale**: Clear indication of whether user has existing progress.

### 5. Fixed Video Layout
**Decision**: Video area doesn't scroll with content
**Rationale**: Maintains video visibility while reading details; standard video player UX.

### 6. Sidebar on Mobile
**Decision**: Sidebar becomes overlay on mobile
**Rationale**: Full-width content on small screens; sidebar accessible via toggle.

### 7. Progress Indicators
**Decision**: Show progress at multiple levels (item, lesson, course)
**Rationale**: Gives users sense of accomplishment and remaining work.

### 8. Loading States
**Decision**: Skeleton loaders matching content shape
**Rationale**: Reduces perceived loading time; prevents layout shift.

## API Integration

### Base Configuration

```typescript
// config/dataSource.ts
export const API_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7277",
  useMockData: false, // Always use real API
};
```

### HTTP Service

The `httpService` handles all API communication:

- **Token Management**: Stores and retrieves access/refresh tokens from localStorage
- **Auto-refresh**: Automatically refreshes expired tokens on 401 responses
- **Response Wrapping**: Extracts data from `ApiResponse<T>` wrapper
- **Error Handling**: Provides consistent error handling across the app

### API Endpoints Used

| Service | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Auth | `/api/auth/login` | POST | User login |
| Auth | `/api/auth/register` | POST | User registration |
| Auth | `/api/auth/refresh` | POST | Token refresh |
| Auth | `/api/auth/me` | GET | Get current user profile |
| Course | `/api/Course` | GET | List all courses |
| Course | `/api/Course/{id}` | GET | Get course by ID |
| Course | `/api/Course/category/{id}` | GET | Get courses by category |
| Category | `/api/Category` | GET | List all categories |
| Lesson | `/api/Lesson/course/{id}` | GET | Get lessons by course |
| Lesson | `/api/Lesson/{id}` | GET | Get lesson by ID |
| LessonItem | `/api/LessonItem/lesson/{id}` | GET | Get items by lesson |
| LessonItem | `/api/LessonItem/lessonProgress/{id}` | GET | Get items with progress |
| Enrollment | `/api/enrollments` | POST | Enroll in course |
| Enrollment | `/api/enrollments/user` | GET | Get user's enrolled courses |
| Enrollment | `/api/enrollments/favourite/course` | GET | Get user's favorites |
| Enrollment | `/api/enrollments/toggleFavourite` | PUT | Toggle favorite status |
| Progress | `/api/LessonItemProgress` | POST | Mark item as completed |

## State Management

The application uses React's built-in state management:

- **Local State**: `useState` for component-level state
- **Effects**: `useEffect` for data fetching and side effects
- **Context**: Not currently used; services provide shared functionality
- **localStorage**: Persists auth tokens and user data

## UI/UX Patterns

### Loading States
- Skeleton loaders (pulse animations) during data fetch
- `PuzzleLoader` component for full-page loading

### Error States
- Error messages displayed inline
- `AlertCircle` icon with error text
- Fallback UI for missing data

### "Not Implemented Yet" Labels
Features without API support display:
```tsx
<span className="text-xs text-muted-foreground/70">Not implemented yet</span>
```

Currently marked as not implemented:
- Hours learned tracking
- Certificates
- Completion rate statistics
- Course ratings/reviews
- Quiz/Question functionality

## Key Design Decisions

### 1. Direct API Calls (No DataProvider)
Services call httpService directly, removing the mock data toggle layer for cleaner code.

### 2. DTOs Match Backend Exactly
Frontend DTOs mirror backend contracts precisely to ensure type safety.

### 3. Service Layer Pattern
Each entity has its own service with:
- CRUD operations
- DTO to UI model mapping
- Business logic encapsulation

### 4. Simplified Course Model
The `Course` interface contains only fields available from the API:
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  categoryName?: string;
  isEnrolled?: boolean;
  isFavourite?: boolean;
  lessons?: Lesson[];
}
```

### 5. Progress Tracking via Lesson Items
- Each lesson contains multiple lesson items
- Items have types: video, text, question
- Completion tracked per item via `LessonItemProgress`
- Progress percentage calculated client-side

## Extension Guidelines

### Adding a New Feature

1. **Create DTO** in `/dtos/[feature]/` matching backend contract
2. **Create Service** in `/services/[feature]Service.ts` with API calls
3. **Create/Update Page** in `/app/` with proper loading/error states
4. **Update Types** if needed in service files

### Adding a New API Endpoint

1. Add endpoint to the appropriate service
2. Create request/response DTOs if needed
3. Handle in httpService if auth required
4. Update this documentation

### Styling Guidelines

- Use Tailwind CSS utility classes
- Use shadcn/ui components from `/components/ui/`
- Follow existing color scheme: `primary`, `accent`, `success`, `warning`, `destructive`
- Maintain responsive design with `md:` and `lg:` breakpoints

## Files to Delete (Cleanup)

The following files are no longer needed and can be deleted:
- `/services/mockData.ts` - Mock data (replaced by real API)
- `/lib/dataProvider.ts` - Data provider toggle (removed)
- `/mappers/` - Mappers (integrated into services)

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://localhost:7277
```

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Ensure the TAIF ServerAPI is running at the configured URL before starting the frontend.
