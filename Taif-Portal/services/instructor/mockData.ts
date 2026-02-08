/**
 * Mock Data for Instructor Portal
 * Phase 1: Frontend-only implementation
 * TODO: API Integration - Remove mock data in Phase 2
 */

import {
  Instructor,
  InstructorCourse,
  InstructorLesson,
  InstructorLessonItem,
  CourseReview,
  Category,
  DashboardStats,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
} from '@/types/instructor';

// ============================================
// Mock Instructor
// ============================================

export const mockInstructor: Instructor = {
  id: 'inst-001',
  firstName: 'Ahmed',
  lastName: 'Al-Rashid',
  email: 'ahmed.rashid@taifportal.com',
  avatar: '/avatars/instructor-1.jpg',
  bio: 'Senior software engineer with 10+ years of experience in web development and education technology.',
  expertise: ['Web Development', 'React', 'TypeScript', 'Node.js'],
  totalCourses: 5,
  totalStudents: 1247,
  averageRating: 4.7,
  createdAt: '2024-01-15T10:00:00Z',
};

// ============================================
// Mock Categories
// ============================================

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Web Development', description: 'Frontend and backend web technologies' },
  { id: 'cat-2', name: 'Mobile Development', description: 'iOS, Android, and cross-platform development' },
  { id: 'cat-3', name: 'Data Science', description: 'Machine learning, AI, and data analysis' },
  { id: 'cat-4', name: 'Design', description: 'UI/UX design and graphic design' },
  { id: 'cat-5', name: 'Business', description: 'Entrepreneurship and management' },
];

// ============================================
// Mock Standalone Video Content
// ============================================

export const mockVideos: VideoContent[] = [
  {
    id: 'video-1',
    title: 'Introduction to HTML',
    description: 'Learn the basics of HTML markup language',
    videoUrl: 'https://example.com/videos/intro-html.mp4',
    duration: 720,
    thumbnailUrl: '/thumbnails/html-intro.jpg',
    instructorId: 'inst-001',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'video-2',
    title: 'CSS Fundamentals',
    description: 'Understanding CSS styling and selectors',
    videoUrl: 'https://example.com/videos/css-fundamentals.mp4',
    duration: 900,
    thumbnailUrl: '/thumbnails/css-intro.jpg',
    instructorId: 'inst-001',
    createdAt: '2024-06-02T10:00:00Z',
    updatedAt: '2024-06-02T10:00:00Z',
  },
  {
    id: 'video-3',
    title: 'JavaScript Basics',
    description: 'Getting started with JavaScript programming',
    videoUrl: 'https://example.com/videos/js-basics.mp4',
    duration: 1200,
    thumbnailUrl: '/thumbnails/js-intro.jpg',
    instructorId: 'inst-001',
    createdAt: '2024-06-03T10:00:00Z',
    updatedAt: '2024-06-03T10:00:00Z',
  },
  {
    id: 'video-4',
    title: 'React Components',
    description: 'Understanding React component architecture',
    videoUrl: 'https://example.com/videos/react-components.mp4',
    duration: 1500,
    instructorId: 'inst-001',
    createdAt: '2024-06-04T10:00:00Z',
    updatedAt: '2024-06-04T10:00:00Z',
  },
];

// ============================================
// Mock Standalone Rich Content
// ============================================

export const mockRichContents: RichContent[] = [
  {
    id: 'rich-1',
    title: 'HTML Document Structure',
    description: 'Learn about the basic structure of an HTML document',
    htmlContent: `
      <h2>HTML Document Structure</h2>
      <p>Every HTML document follows a basic structure that includes the following elements:</p>
      <ul>
        <li><strong>&lt;!DOCTYPE html&gt;</strong> - Declares the document type</li>
        <li><strong>&lt;html&gt;</strong> - The root element</li>
        <li><strong>&lt;head&gt;</strong> - Contains metadata</li>
        <li><strong>&lt;body&gt;</strong> - Contains visible content</li>
      </ul>
      <h3>Example</h3>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
    `,
    instructorId: 'inst-001',
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-01T11:00:00Z',
  },
  {
    id: 'rich-2',
    title: 'CSS Box Model Explained',
    description: 'Understanding the CSS box model concept',
    htmlContent: `
      <h2>The CSS Box Model</h2>
      <p>Every element in CSS is represented as a rectangular box. The box model describes how these boxes are sized.</p>
      <h3>Components</h3>
      <ol>
        <li><strong>Content</strong> - The actual content of the element</li>
        <li><strong>Padding</strong> - Space between content and border</li>
        <li><strong>Border</strong> - The border around the padding</li>
        <li><strong>Margin</strong> - Space outside the border</li>
      </ol>
    `,
    instructorId: 'inst-001',
    createdAt: '2024-06-02T11:00:00Z',
    updatedAt: '2024-06-02T11:00:00Z',
  },
  {
    id: 'rich-3',
    title: 'JavaScript Variables',
    description: 'Learn about var, let, and const in JavaScript',
    htmlContent: `
      <h2>JavaScript Variables</h2>
      <p>Variables are containers for storing data values. In JavaScript, we have three ways to declare variables:</p>
      <ul>
        <li><code>var</code> - Function-scoped, can be re-declared</li>
        <li><code>let</code> - Block-scoped, cannot be re-declared</li>
        <li><code>const</code> - Block-scoped, cannot be reassigned</li>
      </ul>
      <p><em>Best Practice:</em> Use <code>const</code> by default, and <code>let</code> when you need to reassign.</p>
    `,
    instructorId: 'inst-001',
    createdAt: '2024-06-03T11:00:00Z',
    updatedAt: '2024-06-03T11:00:00Z',
  },
];

// ============================================
// Mock Standalone Questions with Answers
// ============================================

export const mockQuestions: QuestionWithAnswers[] = [
  {
    id: 'question-1',
    text: 'What is the correct syntax for referring to an external script called "script.js"?',
    description: 'HTML script tag syntax',
    type: 'multiple-choice',
    answers: [
      { id: 'a-1', text: '<script href="script.js">', isCorrect: false, order: 1 },
      { id: 'a-2', text: '<script name="script.js">', isCorrect: false, order: 2 },
      { id: 'a-3', text: '<script src="script.js">', isCorrect: true, order: 3 },
      { id: 'a-4', text: '<script file="script.js">', isCorrect: false, order: 4 },
    ],
    instructorId: 'inst-001',
    createdAt: '2024-06-01T12:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
  },
  {
    id: 'question-2',
    text: 'Which HTML element is used to define the title of a document?',
    description: 'HTML head elements',
    type: 'multiple-choice',
    answers: [
      { id: 'a-5', text: '<meta>', isCorrect: false, order: 1 },
      { id: 'a-6', text: '<title>', isCorrect: true, order: 2 },
      { id: 'a-7', text: '<head>', isCorrect: false, order: 3 },
      { id: 'a-8', text: '<header>', isCorrect: false, order: 4 },
    ],
    instructorId: 'inst-001',
    createdAt: '2024-06-01T12:30:00Z',
    updatedAt: '2024-06-01T12:30:00Z',
  },
  {
    id: 'question-3',
    text: 'Which CSS property is used to change the text color?',
    description: 'CSS text styling',
    type: 'multiple-choice',
    answers: [
      { id: 'a-9', text: 'font-color', isCorrect: false, order: 1 },
      { id: 'a-10', text: 'text-color', isCorrect: false, order: 2 },
      { id: 'a-11', text: 'color', isCorrect: true, order: 3 },
      { id: 'a-12', text: 'foreground-color', isCorrect: false, order: 4 },
    ],
    instructorId: 'inst-001',
    createdAt: '2024-06-02T12:00:00Z',
    updatedAt: '2024-06-02T12:00:00Z',
  },
  {
    id: 'question-4',
    text: 'JavaScript is a statically typed language.',
    description: 'JavaScript fundamentals',
    type: 'true-false',
    answers: [
      { id: 'a-13', text: 'True', isCorrect: false, order: 1 },
      { id: 'a-14', text: 'False', isCorrect: true, order: 2 },
    ],
    instructorId: 'inst-001',
    createdAt: '2024-06-03T12:00:00Z',
    updatedAt: '2024-06-03T12:00:00Z',
  },
];

// ============================================
// Mock Lesson Items (References to Content)
// ============================================

const mockLessonItems1: InstructorLessonItem[] = [
  {
    id: 'item-1',
    title: 'Introduction to HTML',
    type: 'video',
    order: 1,
    lessonId: 'lesson-1',
    videoContentId: 'video-1',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'item-2',
    title: 'HTML Document Structure',
    type: 'rich-content',
    order: 2,
    lessonId: 'lesson-1',
    richContentId: 'rich-1',
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-01T11:00:00Z',
  },
  {
    id: 'item-3',
    title: 'HTML Basics Quiz',
    type: 'question',
    order: 3,
    lessonId: 'lesson-1',
    questionId: 'question-1',
    createdAt: '2024-06-01T12:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
  },
];

const mockLessonItems2: InstructorLessonItem[] = [
  {
    id: 'item-4',
    title: 'CSS Fundamentals Video',
    type: 'video',
    order: 1,
    lessonId: 'lesson-2',
    videoContentId: 'video-2',
    createdAt: '2024-06-02T10:00:00Z',
    updatedAt: '2024-06-02T10:00:00Z',
  },
  {
    id: 'item-5',
    title: 'CSS Box Model',
    type: 'rich-content',
    order: 2,
    lessonId: 'lesson-2',
    richContentId: 'rich-2',
    createdAt: '2024-06-02T11:00:00Z',
    updatedAt: '2024-06-02T11:00:00Z',
  },
];

// ============================================
// Mock Lessons
// ============================================

const mockLessons1: InstructorLesson[] = [
  {
    id: 'lesson-1',
    title: 'HTML Fundamentals',
    description: 'Learn the basics of HTML including elements, attributes, and document structure.',
    order: 1,
    courseId: 'course-1',
    items: mockLessonItems1,
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
  },
  {
    id: 'lesson-2',
    title: 'CSS Basics',
    description: 'Introduction to CSS styling, selectors, and the box model.',
    order: 2,
    courseId: 'course-1',
    items: mockLessonItems2,
    createdAt: '2024-06-02T09:00:00Z',
    updatedAt: '2024-06-02T10:00:00Z',
  },
  {
    id: 'lesson-3',
    title: 'JavaScript Introduction',
    description: 'Getting started with JavaScript programming.',
    order: 3,
    courseId: 'course-1',
    items: [],
    createdAt: '2024-06-03T09:00:00Z',
    updatedAt: '2024-06-03T09:00:00Z',
  },
];

// ============================================
// Mock Courses
// ============================================

export const mockCourses: InstructorCourse[] = [
  {
    id: 'course-1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive bootcamp.',
    thumbnail: '/courses/web-dev.jpg',
    categoryId: 'cat-1',
    categoryName: 'Web Development',
    status: 'published',
    instructorId: 'inst-001',
    lessons: mockLessons1,
    stats: {
      totalStudents: 456,
      totalLessons: 3,
      totalItems: 4,
      averageRating: 4.8,
      reviewCount: 89,
      completionRate: 67,
    },
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-06-10T15:30:00Z',
  },
  {
    id: 'course-2',
    title: 'React Masterclass',
    description: 'Master React.js from basics to advanced concepts including hooks, context, and Redux.',
    thumbnail: '/courses/react.jpg',
    categoryId: 'cat-1',
    categoryName: 'Web Development',
    status: 'published',
    instructorId: 'inst-001',
    lessons: [],
    stats: {
      totalStudents: 312,
      totalLessons: 0,
      totalItems: 0,
      averageRating: 4.9,
      reviewCount: 56,
      completionRate: 72,
    },
    createdAt: '2024-04-20T10:00:00Z',
    updatedAt: '2024-06-08T12:00:00Z',
  },
  {
    id: 'course-3',
    title: 'TypeScript for Beginners',
    description: 'Learn TypeScript from scratch and understand how to add type safety to your JavaScript projects.',
    thumbnail: '/courses/typescript.jpg',
    categoryId: 'cat-1',
    categoryName: 'Web Development',
    status: 'draft',
    instructorId: 'inst-001',
    lessons: [],
    stats: {
      totalStudents: 0,
      totalLessons: 0,
      totalItems: 0,
      averageRating: 0,
      reviewCount: 0,
      completionRate: 0,
    },
    createdAt: '2024-06-20T10:00:00Z',
    updatedAt: '2024-06-20T10:00:00Z',
  },
  {
    id: 'course-4',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    thumbnail: '/courses/nodejs.jpg',
    categoryId: 'cat-1',
    categoryName: 'Web Development',
    status: 'published',
    instructorId: 'inst-001',
    lessons: [],
    stats: {
      totalStudents: 289,
      totalLessons: 0,
      totalItems: 0,
      averageRating: 4.6,
      reviewCount: 42,
      completionRate: 58,
    },
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-06-05T14:00:00Z',
  },
  {
    id: 'course-5',
    title: 'Advanced CSS Animations',
    description: 'Create stunning animations and transitions with pure CSS.',
    thumbnail: '/courses/css-animations.jpg',
    categoryId: 'cat-4',
    categoryName: 'Design',
    status: 'archived',
    instructorId: 'inst-001',
    lessons: [],
    stats: {
      totalStudents: 190,
      totalLessons: 0,
      totalItems: 0,
      averageRating: 4.5,
      reviewCount: 28,
      completionRate: 82,
    },
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
];

// ============================================
// Mock Reviews
// ============================================

export const mockReviews: CourseReview[] = [
  {
    id: 'review-1',
    courseId: 'course-1',
    studentId: 'student-1',
    studentName: 'Sarah Johnson',
    studentAvatar: '/avatars/student-1.jpg',
    rating: 5,
    comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
    createdAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'review-2',
    courseId: 'course-1',
    studentId: 'student-2',
    studentName: 'Michael Chen',
    studentAvatar: '/avatars/student-2.jpg',
    rating: 4,
    comment: 'Great content and well-structured lessons. Would love to see more advanced topics.',
    createdAt: '2024-06-12T14:30:00Z',
  },
  {
    id: 'review-3',
    courseId: 'course-1',
    studentId: 'student-3',
    studentName: 'Emma Wilson',
    rating: 5,
    comment: 'This bootcamp changed my career! Highly recommended for anyone starting in web development.',
    createdAt: '2024-06-10T09:15:00Z',
  },
  {
    id: 'review-4',
    courseId: 'course-2',
    studentId: 'student-4',
    studentName: 'David Lee',
    studentAvatar: '/avatars/student-4.jpg',
    rating: 5,
    comment: 'The best React course I have ever taken. The hooks section is incredibly detailed.',
    createdAt: '2024-06-08T16:45:00Z',
  },
  {
    id: 'review-5',
    courseId: 'course-2',
    studentId: 'student-5',
    studentName: 'Lisa Brown',
    rating: 4,
    comment: 'Very comprehensive course. The Redux section could use a bit more examples.',
    createdAt: '2024-06-05T11:20:00Z',
  },
];

// ============================================
// Mock Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
  totalCourses: 5,
  publishedCourses: 3,
  draftCourses: 1,
  totalStudents: 1247,
  totalReviews: 215,
  averageRating: 4.7,
  recentActivity: [
    {
      id: 'activity-1',
      type: 'enrollment',
      message: 'New student enrolled in "Complete Web Development Bootcamp"',
      timestamp: '2024-06-20T15:30:00Z',
    },
    {
      id: 'activity-2',
      type: 'review',
      message: 'Sarah Johnson left a 5-star review on "Complete Web Development Bootcamp"',
      timestamp: '2024-06-20T14:15:00Z',
    },
    {
      id: 'activity-3',
      type: 'enrollment',
      message: '3 new students enrolled in "React Masterclass"',
      timestamp: '2024-06-20T12:00:00Z',
    },
    {
      id: 'activity-4',
      type: 'lesson_added',
      message: 'You added a new lesson to "TypeScript for Beginners"',
      timestamp: '2024-06-19T16:45:00Z',
    },
    {
      id: 'activity-5',
      type: 'course_published',
      message: 'You published "Node.js Backend Development"',
      timestamp: '2024-06-18T10:00:00Z',
    },
  ],
};
