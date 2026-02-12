/**
 * Data Service for Instructor Portal
 * 
 * This service provides a clean API interface for all data operations.
 * Currently uses in-memory state for mock implementation.
 * Can be easily swapped with real API calls by implementing the same interface.
 */

import {
  Instructor,
  InstructorCourse,
  InstructorLesson,
  InstructorLessonItem,
  DashboardStats,
  Category,
  CourseReview,
  ReviewStats,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
  Answer,
  CourseStatus,
  LessonItemType,
} from '@/types/instructor';

// ============================================
// Input Types for Create/Update Operations
// ============================================

export interface CreateVideoInput {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface CreateRichContentInput {
  title: string;
  description?: string;
  htmlContent: string;
}

export interface UpdateRichContentInput {
  title?: string;
  description?: string;
  htmlContent?: string;
}

export interface CreateAnswerInput {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  text: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers: CreateAnswerInput[];
}

export interface UpdateQuestionInput {
  text?: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers?: Answer[];
}

export interface CreateLessonItemInput {
  title: string;
  description?: string;
  type: LessonItemType;
  lessonId?: string;
  videoContentId?: string;
  richContentId?: string;
  questionId?: string;
}

export interface UpdateLessonItemInput {
  title?: string;
  description?: string;
  order?: number;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  courseId?: string;
  itemIds?: string[];
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  order?: number;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  categoryId: string;
  thumbnail?: string;
  lessonIds?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  categoryId?: string;
  thumbnail?: string;
}

// ============================================
// Data Service Interface
// ============================================

export interface UpdateInstructorInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string[];
  avatar?: string;
}

export interface IDataService {
  // Instructor
  getInstructor(): Promise<Instructor>;
  updateInstructor(input: UpdateInstructorInput): Promise<Instructor>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  
  // Videos
  getVideos(): Promise<VideoContent[]>;
  getVideoById(id: string): Promise<VideoContent | null>;
  createVideo(input: CreateVideoInput): Promise<VideoContent>;
  updateVideo(id: string, input: UpdateVideoInput): Promise<VideoContent | null>;
  deleteVideo(id: string): Promise<boolean>;
  
  // Rich Content
  getRichContents(): Promise<RichContent[]>;
  getRichContentById(id: string): Promise<RichContent | null>;
  createRichContent(input: CreateRichContentInput): Promise<RichContent>;
  updateRichContent(id: string, input: UpdateRichContentInput): Promise<RichContent | null>;
  deleteRichContent(id: string): Promise<boolean>;
  
  // Questions
  getQuestions(): Promise<QuestionWithAnswers[]>;
  getQuestionById(id: string): Promise<QuestionWithAnswers | null>;
  createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers>;
  updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null>;
  deleteQuestion(id: string): Promise<boolean>;
  
  // Lesson Items (standalone, can be added to lessons)
  getLessonItems(): Promise<InstructorLessonItem[]>;
  getLessonItemById(id: string): Promise<InstructorLessonItem | null>;
  createLessonItem(input: CreateLessonItemInput): Promise<InstructorLessonItem>;
  updateLessonItem(id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null>;
  deleteLessonItem(id: string): Promise<boolean>;
  
  // Lessons (standalone, can be added to courses)
  getLessons(): Promise<InstructorLesson[]>;
  getLessonById(id: string): Promise<InstructorLesson | null>;
  createLesson(input: CreateLessonInput): Promise<InstructorLesson>;
  updateLesson(id: string, input: UpdateLessonInput): Promise<InstructorLesson | null>;
  deleteLesson(id: string): Promise<boolean>;
  addItemsToLesson(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null>;
  removeItemFromLesson(lessonId: string, itemId: string): Promise<InstructorLesson | null>;
  reorderLessonItems(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null>;
  
  // Courses
  getCourses(): Promise<InstructorCourse[]>;
  getCourseById(id: string): Promise<InstructorCourse | null>;
  createCourse(input: CreateCourseInput): Promise<InstructorCourse>;
  updateCourse(id: string, input: UpdateCourseInput): Promise<InstructorCourse | null>;
  deleteCourse(id: string): Promise<boolean>;
  addLessonsToCourse(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null>;
  removeLessonFromCourse(courseId: string, lessonId: string): Promise<InstructorCourse | null>;
  reorderCourseLessons(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null>;
  
  // Course Status
  publishCourse(id: string): Promise<InstructorCourse | null>;
  archiveCourse(id: string): Promise<InstructorCourse | null>;
  unpublishCourse(id: string): Promise<InstructorCourse | null>;
  
  // Reviews
  getReviewsByCourse(courseId: string): Promise<CourseReview[]>;
  getReviewStats(courseId: string): Promise<ReviewStats>;
}

// ============================================
// Helper Functions
// ============================================

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const delay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================
// In-Memory Data Store
// ============================================

interface DataStore {
  instructor: Instructor;
  categories: Category[];
  videos: VideoContent[];
  richContents: RichContent[];
  questions: QuestionWithAnswers[];
  lessonItems: InstructorLessonItem[];
  lessons: InstructorLesson[];
  courses: InstructorCourse[];
  reviews: CourseReview[];
}

// Initial mock data
const createInitialData = (): DataStore => {
  const now = new Date().toISOString();
  const instructorId = 'instructor-1';

  // Categories
  const categories: Category[] = [
    { id: 'cat-1', name: 'Programming', description: 'Software development courses' },
    { id: 'cat-2', name: 'Design', description: 'UI/UX and graphic design' },
    { id: 'cat-3', name: 'Business', description: 'Business and management' },
    { id: 'cat-4', name: 'Mathematics', description: 'Math and statistics' },
    { id: 'cat-5', name: 'Science', description: 'Natural sciences' },
  ];

  // Videos
  const videos: VideoContent[] = [
    {
      id: 'video-1',
      title: 'Introduction to JavaScript',
      description: 'Learn the basics of JavaScript programming',
      videoUrl: 'https://example.com/videos/js-intro.mp4',
      duration: 600,
      thumbnailUrl: 'https://picsum.photos/seed/v1/320/180',
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'video-2',
      title: 'Variables and Data Types',
      description: 'Understanding variables and data types in JavaScript',
      videoUrl: 'https://example.com/videos/js-variables.mp4',
      duration: 480,
      thumbnailUrl: 'https://picsum.photos/seed/v2/320/180',
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'video-3',
      title: 'Functions and Scope',
      description: 'Deep dive into functions and variable scope',
      videoUrl: 'https://example.com/videos/js-functions.mp4',
      duration: 720,
      thumbnailUrl: 'https://picsum.photos/seed/v3/320/180',
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Rich Content
  const richContents: RichContent[] = [
    {
      id: 'rich-1',
      title: 'JavaScript Basics Guide',
      description: 'A comprehensive guide to JavaScript fundamentals',
      htmlContent: '<h2>Welcome to JavaScript</h2><p>JavaScript is a versatile programming language...</p><ul><li>Variables</li><li>Functions</li><li>Objects</li></ul>',
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rich-2',
      title: 'Code Examples',
      description: 'Practical code examples for beginners',
      htmlContent: '<h2>Code Examples</h2><pre><code>const greeting = "Hello World";\nconsole.log(greeting);</code></pre>',
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Questions
  const questions: QuestionWithAnswers[] = [
    {
      id: 'question-1',
      text: 'What is the correct way to declare a variable in JavaScript?',
      description: 'Test your knowledge of variable declaration',
      type: 'multiple-choice',
      answers: [
        { id: 'ans-1', text: 'var x = 5;', isCorrect: true, order: 1 },
        { id: 'ans-2', text: 'variable x = 5;', isCorrect: false, order: 2 },
        { id: 'ans-3', text: 'x := 5;', isCorrect: false, order: 3 },
        { id: 'ans-4', text: 'int x = 5;', isCorrect: false, order: 4 },
      ],
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'question-2',
      text: 'JavaScript is a statically typed language.',
      description: 'True or false question about JavaScript typing',
      type: 'true-false',
      answers: [
        { id: 'ans-5', text: 'True', isCorrect: false, order: 1 },
        { id: 'ans-6', text: 'False', isCorrect: true, order: 2 },
      ],
      instructorId,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Lesson Items
  const lessonItems: InstructorLessonItem[] = [
    {
      id: 'item-1',
      title: 'Watch: Introduction to JavaScript',
      description: 'Video introduction',
      type: 'video',
      videoContentId: 'video-1',
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'item-2',
      title: 'Read: JavaScript Basics Guide',
      description: 'Reading material',
      type: 'rich-content',
      richContentId: 'rich-1',
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'item-3',
      title: 'Quiz: Variable Declaration',
      description: 'Test your knowledge',
      type: 'question',
      questionId: 'question-1',
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Lessons
  const lessons: InstructorLesson[] = [
    {
      id: 'lesson-1',
      title: 'Getting Started with JavaScript',
      description: 'Your first steps into JavaScript programming',
      order: 1,
      items: [lessonItems[0], lessonItems[1], lessonItems[2]],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Courses
  const courses: InstructorCourse[] = [
    {
      id: 'course-1',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch with hands-on examples and projects.',
      thumbnail: 'https://picsum.photos/seed/course1/400/225',
      categoryId: 'cat-1',
      categoryName: 'Programming',
      status: 'draft',
      instructorId,
      lessons: [lessons[0]],
      stats: {
        totalLessons: 1,
        totalItems: 3,
        totalEnrollments: 0,
        averageRating: 0,
        totalReviews: 0,
        totalStudents: 0,
        completionRate: 0,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-2',
      title: 'React Development',
      description: 'Master React.js and build modern web applications with hooks and state management.',
      thumbnail: 'https://picsum.photos/seed/course2/400/225',
      categoryId: 'cat-1',
      categoryName: 'Programming',
      status: 'published',
      instructorId,
      lessons: [],
      stats: {
        totalLessons: 0,
        totalItems: 0,
        totalEnrollments: 45,
        averageRating: 4.7,
        totalReviews: 12,
        totalStudents: 45,
        completionRate: 75,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-3',
      title: 'UI/UX Design Principles',
      description: 'Learn the fundamentals of user interface and user experience design.',
      thumbnail: 'https://picsum.photos/seed/course3/400/225',
      categoryId: 'cat-2',
      categoryName: 'Design',
      status: 'published',
      instructorId,
      lessons: [],
      stats: {
        totalLessons: 0,
        totalItems: 0,
        totalEnrollments: 120,
        averageRating: 4.9,
        totalReviews: 28,
        totalStudents: 120,
        completionRate: 85,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'course-4',
      title: 'Business Analytics',
      description: 'Data-driven decision making for business professionals.',
      thumbnail: 'https://picsum.photos/seed/course4/400/225',
      categoryId: 'cat-3',
      categoryName: 'Business',
      status: 'archived',
      instructorId,
      lessons: [],
      stats: {
        totalLessons: 0,
        totalItems: 0,
        totalEnrollments: 200,
        averageRating: 4.5,
        totalReviews: 45,
        totalStudents: 200,
        completionRate: 60,
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Reviews (empty for now)
  const reviews: CourseReview[] = [];

  // Instructor
  const instructor: Instructor = {
    id: instructorId,
    firstName: 'John',
    lastName: 'Instructor',
    email: 'john@example.com',
    avatar: 'https://picsum.photos/seed/instructor/100/100',
    bio: 'Experienced software developer and educator',
    createdAt: now,
  };

  return {
    instructor,
    categories,
    videos,
    richContents,
    questions,
    lessonItems,
    lessons,
    courses,
    reviews,
  };
};

// ============================================
// Mock Data Service Implementation
// ============================================

class MockDataService implements IDataService {
  private data: DataStore;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = createInitialData();
  }

  // Subscribe to data changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Reset data to initial state
  resetData(): void {
    this.data = createInitialData();
    this.notifyListeners();
  }

  // ============================================
  // Instructor
  // ============================================

  async getInstructor(): Promise<Instructor> {
    await delay();
    return { ...this.data.instructor };
  }

  async updateInstructor(input: UpdateInstructorInput): Promise<Instructor> {
    await delay();
    this.data.instructor = {
      ...this.data.instructor,
      ...input,
    };
    this.notifyListeners();
    return { ...this.data.instructor };
  }

  // ============================================
  // Categories
  // ============================================

  async getCategories(): Promise<Category[]> {
    await delay();
    return [...this.data.categories];
  }

  // ============================================
  // Dashboard
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    const courses = this.data.courses;
    const publishedCourses = courses.filter(c => c.status === 'published');
    const draftCourses = courses.filter(c => c.status === 'draft');
    
    return {
      totalCourses: courses.length,
      publishedCourses: publishedCourses.length,
      draftCourses: draftCourses.length,
      totalStudents: courses.reduce((sum, c) => sum + c.stats.totalEnrollments, 0),
      totalReviews: courses.reduce((sum, c) => sum + c.stats.totalReviews, 0),
      averageRating: courses.length > 0 
        ? courses.reduce((sum, c) => sum + c.stats.averageRating, 0) / courses.length 
        : 0,
      recentActivity: [],
      popularCourses: courses.slice(0, 5).map(c => ({
        courseId: c.id,
        courseName: c.title,
        enrollments: c.stats.totalEnrollments,
      })),
    };
  }

  // ============================================
  // Videos
  // ============================================

  async getVideos(): Promise<VideoContent[]> {
    await delay();
    return [...this.data.videos];
  }

  async getVideoById(id: string): Promise<VideoContent | null> {
    await delay();
    return this.data.videos.find(v => v.id === id) || null;
  }

  async createVideo(input: CreateVideoInput): Promise<VideoContent> {
    await delay(200);
    const now = new Date().toISOString();
    const video: VideoContent = {
      id: generateId(),
      title: input.title,
      description: input.description,
      videoUrl: input.videoUrl,
      duration: input.duration,
      thumbnailUrl: input.thumbnailUrl,
      instructorId: this.data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    this.data.videos.unshift(video);
    this.notifyListeners();
    return { ...video };
  }

  async updateVideo(id: string, input: UpdateVideoInput): Promise<VideoContent | null> {
    await delay(200);
    const index = this.data.videos.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    this.data.videos[index] = {
      ...this.data.videos[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    return { ...this.data.videos[index] };
  }

  async deleteVideo(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.videos.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    this.data.videos.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  // ============================================
  // Rich Content
  // ============================================

  async getRichContents(): Promise<RichContent[]> {
    await delay();
    return [...this.data.richContents];
  }

  async getRichContentById(id: string): Promise<RichContent | null> {
    await delay();
    return this.data.richContents.find(r => r.id === id) || null;
  }

  async createRichContent(input: CreateRichContentInput): Promise<RichContent> {
    await delay(200);
    const now = new Date().toISOString();
    const content: RichContent = {
      id: generateId(),
      title: input.title,
      description: input.description,
      htmlContent: input.htmlContent,
      instructorId: this.data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    this.data.richContents.unshift(content);
    this.notifyListeners();
    return { ...content };
  }

  async updateRichContent(id: string, input: UpdateRichContentInput): Promise<RichContent | null> {
    await delay(200);
    const index = this.data.richContents.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.data.richContents[index] = {
      ...this.data.richContents[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    return { ...this.data.richContents[index] };
  }

  async deleteRichContent(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.richContents.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.data.richContents.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  // ============================================
  // Questions
  // ============================================

  async getQuestions(): Promise<QuestionWithAnswers[]> {
    await delay();
    return [...this.data.questions];
  }

  async getQuestionById(id: string): Promise<QuestionWithAnswers | null> {
    await delay();
    return this.data.questions.find(q => q.id === id) || null;
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers> {
    await delay(200);
    const now = new Date().toISOString();
    const question: QuestionWithAnswers = {
      id: generateId(),
      text: input.text,
      description: input.description,
      type: input.type || 'multiple-choice',
      answers: input.answers.map((a, i) => ({
        id: generateId(),
        text: a.text,
        isCorrect: a.isCorrect,
        order: i + 1,
      })),
      instructorId: this.data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    this.data.questions.unshift(question);
    this.notifyListeners();
    return { ...question };
  }

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null> {
    await delay(200);
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    
    this.data.questions[index] = {
      ...this.data.questions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    return { ...this.data.questions[index] };
  }

  async deleteQuestion(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return false;
    
    this.data.questions.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  // ============================================
  // Lesson Items
  // ============================================

  async getLessonItems(): Promise<InstructorLessonItem[]> {
    await delay();
    return [...this.data.lessonItems];
  }

  async getLessonItemById(id: string): Promise<InstructorLessonItem | null> {
    await delay();
    return this.data.lessonItems.find(i => i.id === id) || null;
  }

  async createLessonItem(input: CreateLessonItemInput): Promise<InstructorLessonItem> {
    await delay(200);
    const now = new Date().toISOString();
    const item: InstructorLessonItem = {
      id: generateId(),
      title: input.title,
      description: input.description,
      type: input.type,
      videoContentId: input.videoContentId,
      richContentId: input.richContentId,
      questionId: input.questionId,
      order: this.data.lessonItems.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    this.data.lessonItems.unshift(item);
    this.notifyListeners();
    return { ...item };
  }

  async updateLessonItem(id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null> {
    await delay(200);
    const index = this.data.lessonItems.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.data.lessonItems[index] = {
      ...this.data.lessonItems[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    return { ...this.data.lessonItems[index] };
  }

  async deleteLessonItem(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.lessonItems.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.data.lessonItems.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  // ============================================
  // Lessons
  // ============================================

  async getLessons(): Promise<InstructorLesson[]> {
    await delay();
    return this.data.lessons.map(l => ({ ...l, items: [...l.items] }));
  }

  async getLessonById(id: string): Promise<InstructorLesson | null> {
    await delay();
    const lesson = this.data.lessons.find(l => l.id === id);
    return lesson ? { ...lesson, items: [...lesson.items] } : null;
  }

  async createLesson(input: CreateLessonInput): Promise<InstructorLesson> {
    await delay(200);
    const now = new Date().toISOString();
    
    // Get items if itemIds provided
    const items: InstructorLessonItem[] = [];
    if (input.itemIds) {
      input.itemIds.forEach((itemId, index) => {
        const item = this.data.lessonItems.find(i => i.id === itemId);
        if (item) {
          items.push({ ...item, order: index + 1 });
        }
      });
    }
    
    const lesson: InstructorLesson = {
      id: generateId(),
      title: input.title,
      description: input.description,
      order: this.data.lessons.length + 1,
      items,
      createdAt: now,
      updatedAt: now,
    };
    this.data.lessons.unshift(lesson);
    this.notifyListeners();
    return { ...lesson, items: [...lesson.items] };
  }

  async updateLesson(id: string, input: UpdateLessonInput): Promise<InstructorLesson | null> {
    await delay(200);
    const index = this.data.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    this.data.lessons[index] = {
      ...this.data.lessons[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    return { ...this.data.lessons[index], items: [...this.data.lessons[index].items] };
  }

  async deleteLesson(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.lessons.findIndex(l => l.id === id);
    if (index === -1) return false;
    
    this.data.lessons.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  async addItemsToLesson(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> {
    await delay(200);
    const lessonIndex = this.data.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const lesson = this.data.lessons[lessonIndex];
    const existingItemIds = new Set(lesson.items.map(i => i.id));
    
    itemIds.forEach(itemId => {
      if (!existingItemIds.has(itemId)) {
        const item = this.data.lessonItems.find(i => i.id === itemId);
        if (item) {
          lesson.items.push({ ...item, order: lesson.items.length + 1 });
        }
      }
    });
    
    lesson.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return { ...lesson, items: [...lesson.items] };
  }

  async removeItemFromLesson(lessonId: string, itemId: string): Promise<InstructorLesson | null> {
    await delay(200);
    const lessonIndex = this.data.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const lesson = this.data.lessons[lessonIndex];
    lesson.items = lesson.items.filter(i => i.id !== itemId);
    lesson.items.forEach((item, index) => {
      item.order = index + 1;
    });
    lesson.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return { ...lesson, items: [...lesson.items] };
  }

  async reorderLessonItems(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> {
    await delay(200);
    const lessonIndex = this.data.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const lesson = this.data.lessons[lessonIndex];
    const itemMap = new Map(lesson.items.map(i => [i.id, i]));
    
    lesson.items = itemIds
      .map((id, index) => {
        const item = itemMap.get(id);
        return item ? { ...item, order: index + 1 } : null;
      })
      .filter((item): item is InstructorLessonItem => item !== null);
    
    lesson.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return { ...lesson, items: [...lesson.items] };
  }

  // ============================================
  // Courses
  // ============================================

  async getCourses(): Promise<InstructorCourse[]> {
    await delay();
    return this.data.courses.map(c => ({
      ...c,
      lessons: c.lessons.map(l => ({ ...l, items: [...l.items] })),
    }));
  }

  async getCourseById(id: string): Promise<InstructorCourse | null> {
    await delay();
    const course = this.data.courses.find(c => c.id === id);
    if (!course) return null;
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async createCourse(input: CreateCourseInput): Promise<InstructorCourse> {
    await delay(200);
    const now = new Date().toISOString();
    const category = this.data.categories.find(c => c.id === input.categoryId);
    
    // Get lessons if lessonIds provided
    const lessons: InstructorLesson[] = [];
    if (input.lessonIds) {
      input.lessonIds.forEach((lessonId, index) => {
        const lesson = this.data.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lessons.push({ ...lesson, order: index + 1, items: [...lesson.items] });
        }
      });
    }
    
    const totalItems = lessons.reduce((sum, l) => sum + l.items.length, 0);
    
    const course: InstructorCourse = {
      id: generateId(),
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail || 'https://picsum.photos/seed/' + generateId() + '/400/225',
      categoryId: input.categoryId,
      categoryName: category?.name,
      status: 'draft', // Always start as draft
      instructorId: this.data.instructor.id,
      lessons,
      stats: {
        totalLessons: lessons.length,
        totalItems,
        totalEnrollments: 0,
        averageRating: 0,
        totalReviews: 0,
        totalStudents: 0,
        completionRate: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.data.courses.unshift(course);
    this.notifyListeners();
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<InstructorCourse | null> {
    await delay(200);
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const category = input.categoryId 
      ? this.data.categories.find(c => c.id === input.categoryId)
      : null;
    
    this.data.courses[index] = {
      ...this.data.courses[index],
      ...input,
      categoryName: category?.name || this.data.courses[index].categoryName,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners();
    const course = this.data.courses[index];
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async deleteCourse(id: string): Promise<boolean> {
    await delay(200);
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.data.courses.splice(index, 1);
    this.notifyListeners();
    return true;
  }

  async addLessonsToCourse(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null> {
    await delay(200);
    const courseIndex = this.data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = this.data.courses[courseIndex];
    const existingLessonIds = new Set(course.lessons.map(l => l.id));
    
    lessonIds.forEach(lessonId => {
      if (!existingLessonIds.has(lessonId)) {
        const lesson = this.data.lessons.find(l => l.id === lessonId);
        if (lesson) {
          course.lessons.push({ ...lesson, order: course.lessons.length + 1, items: [...lesson.items] });
        }
      }
    });
    
    course.stats.totalLessons = course.lessons.length;
    course.stats.totalItems = course.lessons.reduce((sum, l) => sum + l.items.length, 0);
    course.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async removeLessonFromCourse(courseId: string, lessonId: string): Promise<InstructorCourse | null> {
    await delay(200);
    const courseIndex = this.data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = this.data.courses[courseIndex];
    course.lessons = course.lessons.filter(l => l.id !== lessonId);
    course.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    course.stats.totalLessons = course.lessons.length;
    course.stats.totalItems = course.lessons.reduce((sum, l) => sum + l.items.length, 0);
    course.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async reorderCourseLessons(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null> {
    await delay(200);
    const courseIndex = this.data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = this.data.courses[courseIndex];
    const lessonMap = new Map(course.lessons.map(l => [l.id, l]));
    
    course.lessons = lessonIds
      .map((id, index) => {
        const lesson = lessonMap.get(id);
        return lesson ? { ...lesson, order: index + 1 } : null;
      })
      .filter((lesson): lesson is InstructorLesson => lesson !== null);
    
    course.updatedAt = new Date().toISOString();
    this.notifyListeners();
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  // ============================================
  // Course Status
  // ============================================

  async publishCourse(id: string): Promise<InstructorCourse | null> {
    await delay(200);
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.courses[index].status = 'published';
    this.data.courses[index].updatedAt = new Date().toISOString();
    this.notifyListeners();
    const course = this.data.courses[index];
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async archiveCourse(id: string): Promise<InstructorCourse | null> {
    await delay(200);
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.courses[index].status = 'archived';
    this.data.courses[index].updatedAt = new Date().toISOString();
    this.notifyListeners();
    const course = this.data.courses[index];
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  async unpublishCourse(id: string): Promise<InstructorCourse | null> {
    await delay(200);
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.data.courses[index].status = 'draft';
    this.data.courses[index].updatedAt = new Date().toISOString();
    this.notifyListeners();
    const course = this.data.courses[index];
    return {
      ...course,
      lessons: course.lessons.map(l => ({ ...l, items: [...l.items] })),
    };
  }

  // ============================================
  // Reviews
  // ============================================

  async getReviewsByCourse(courseId: string): Promise<CourseReview[]> {
    await delay();
    return this.data.reviews.filter(r => r.courseId === courseId);
  }

  async getReviewStats(courseId: string): Promise<ReviewStats> {
    await delay();
    const reviews = this.data.reviews.filter(r => r.courseId === courseId);
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    return {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const dataService = new MockDataService();

