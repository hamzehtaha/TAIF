/**
 * Mock Data Provider - Centralized mock data for all services
 * This file contains all mock data used during development
 */

import {
  Category,
  Course,
  CourseStatus,
  CourseWithDetails,
  DashboardStats,
  Instructor,
  Lesson,
  LessonItem,
  LessonItemType,
  LessonWithItems,
  UserRole,
} from '../types';

// Helper to create dates
const now = new Date().toISOString();
const pastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Categories
export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Programming', description: 'Software development courses', photo: '/categories/programming.jpg', createdAt: pastDate(100), updatedAt: now },
  { id: 'cat-2', name: 'Design', description: 'UI/UX and graphic design', photo: '/categories/design.jpg', createdAt: pastDate(100), updatedAt: now },
  { id: 'cat-3', name: 'Business', description: 'Business and entrepreneurship', photo: '/categories/business.jpg', createdAt: pastDate(100), updatedAt: now },
  { id: 'cat-4', name: 'Marketing', description: 'Digital marketing courses', photo: '/categories/marketing.jpg', createdAt: pastDate(100), updatedAt: now },
];

// Instructor
export const mockInstructor: Instructor = {
  id: 'inst-1',
  firstName: 'Mohammed',
  lastName: 'Al-Quran',
  email: 'instructor@taif.com',
  isActive: true,
  interests: [],
  role: UserRole.Instructor,
  avatar: '/avatars/instructor.jpg',
  bio: 'Senior software developer with 10+ years of experience',
  specialization: 'Web Development',
  totalCourses: 5,
  totalStudents: 1250,
  createdAt: pastDate(365),
  updatedAt: now,
};

// Lesson Items (standalone)
export const mockLessonItems: LessonItem[] = [
  {
    id: 'item-1',
    name: 'Introduction to HTML',
    type: LessonItemType.Video,
    content: 'https://example.com/videos/html-intro.mp4',
    order: 1,
    durationInSeconds: 600,
    createdAt: pastDate(30),
    updatedAt: now,
  },
  {
    id: 'item-2',
    name: 'HTML Document Structure',
    type: LessonItemType.RichText,
    content: '<h1>HTML Structure</h1><p>Learn about the basic structure of an HTML document...</p>',
    order: 2,
    durationInSeconds: 300,
    createdAt: pastDate(30),
    updatedAt: now,
  },
  {
    id: 'item-3',
    name: 'HTML Basics Quiz',
    type: LessonItemType.Question,
    content: JSON.stringify({
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language'],
      correctAnswer: 0,
    }),
    order: 3,
    durationInSeconds: 120,
    createdAt: pastDate(30),
    updatedAt: now,
  },
  {
    id: 'item-4',
    name: 'CSS Fundamentals',
    type: LessonItemType.Video,
    content: 'https://example.com/videos/css-fundamentals.mp4',
    order: 1,
    durationInSeconds: 900,
    createdAt: pastDate(25),
    updatedAt: now,
  },
  {
    id: 'item-5',
    name: 'CSS Selectors Guide',
    type: LessonItemType.RichText,
    content: '<h1>CSS Selectors</h1><p>Understanding different types of CSS selectors...</p>',
    order: 2,
    durationInSeconds: 400,
    createdAt: pastDate(25),
    updatedAt: now,
  },
  {
    id: 'item-6',
    name: 'JavaScript Introduction',
    type: LessonItemType.Video,
    content: 'https://example.com/videos/js-intro.mp4',
    order: 1,
    durationInSeconds: 1200,
    createdAt: pastDate(20),
    updatedAt: now,
  },
];

// Lessons (standalone)
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Getting Started with HTML',
    description: 'Learn the basics of HTML markup language',
    order: 1,
    photo: '/lessons/html.jpg',
    createdAt: pastDate(30),
    updatedAt: now,
  },
  {
    id: 'lesson-2',
    title: 'CSS Styling Basics',
    description: 'Introduction to CSS and styling web pages',
    order: 2,
    photo: '/lessons/css.jpg',
    createdAt: pastDate(25),
    updatedAt: now,
  },
  {
    id: 'lesson-3',
    title: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts and syntax',
    order: 3,
    photo: '/lessons/js.jpg',
    createdAt: pastDate(20),
    updatedAt: now,
  },
];

// Lesson to Items mapping
export const mockLessonItemMappings: Record<string, string[]> = {
  'lesson-1': ['item-1', 'item-2', 'item-3'],
  'lesson-2': ['item-4', 'item-5'],
  'lesson-3': ['item-6'],
};

// Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Web Development Bootcamp',
    description: 'Complete web development course from beginner to advanced',
    photo: '/courses/webdev.jpg',
    categoryId: 'cat-1',
    tags: ['html', 'css', 'javascript'],
    status: CourseStatus.Published,
    instructorId: 'inst-1',
    createdAt: pastDate(60),
    updatedAt: now,
  },
  {
    id: 'course-2',
    name: 'React Masterclass',
    description: 'Master React.js from basics to advanced patterns',
    photo: '/courses/react.jpg',
    categoryId: 'cat-1',
    tags: ['react', 'javascript', 'frontend'],
    status: CourseStatus.Draft,
    instructorId: 'inst-1',
    createdAt: pastDate(30),
    updatedAt: now,
  },
];

// Course to Lessons mapping
export const mockCourseLessonMappings: Record<string, string[]> = {
  'course-1': ['lesson-1', 'lesson-2', 'lesson-3'],
  'course-2': [],
};

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalCourses: 2,
  totalStudents: 1250,
  totalLessons: 3,
  totalReviews: 45,
  averageRating: 4.7,
  recentEnrollments: 28,
};

/**
 * MockDataStore - Manages mock data state with CRUD operations
 */
class MockDataStore {
  private categories: Category[] = [...mockCategories];
  private instructor: Instructor = { ...mockInstructor };
  private lessonItems: LessonItem[] = [...mockLessonItems];
  private lessons: Lesson[] = [...mockLessons];
  private courses: Course[] = [...mockCourses];
  private lessonItemMappings: Record<string, string[]> = { ...mockLessonItemMappings };
  private courseLessonMappings: Record<string, string[]> = { ...mockCourseLessonMappings };

  // Simulate network delay
  private async delay(ms: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate ID
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    await this.delay();
    return [...this.categories];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    await this.delay();
    return this.categories.find(c => c.id === id) || null;
  }

  // Instructor
  async getInstructor(): Promise<Instructor> {
    await this.delay();
    return { ...this.instructor };
  }

  // Lesson Items
  async getLessonItems(): Promise<LessonItem[]> {
    await this.delay();
    return [...this.lessonItems];
  }

  async getLessonItemById(id: string): Promise<LessonItem | null> {
    await this.delay();
    return this.lessonItems.find(i => i.id === id) || null;
  }

  async getLessonItemsByLessonId(lessonId: string): Promise<LessonItem[]> {
    await this.delay();
    const itemIds = this.lessonItemMappings[lessonId] || [];
    return this.lessonItems
      .filter(i => itemIds.includes(i.id))
      .sort((a, b) => a.order - b.order);
  }

  async createLessonItem(data: Omit<LessonItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<LessonItem> {
    await this.delay();
    const item: LessonItem = {
      ...data,
      id: this.generateId('item'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.lessonItems.push(item);
    return item;
  }

  async updateLessonItem(id: string, data: Partial<LessonItem>): Promise<LessonItem | null> {
    await this.delay();
    const index = this.lessonItems.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    this.lessonItems[index] = {
      ...this.lessonItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.lessonItems[index];
  }

  async deleteLessonItem(id: string): Promise<boolean> {
    await this.delay();
    const index = this.lessonItems.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.lessonItems.splice(index, 1);
    
    // Remove from mappings
    Object.keys(this.lessonItemMappings).forEach(lessonId => {
      this.lessonItemMappings[lessonId] = this.lessonItemMappings[lessonId].filter(itemId => itemId !== id);
    });
    
    return true;
  }

  // Lessons
  async getLessons(): Promise<Lesson[]> {
    await this.delay();
    return [...this.lessons];
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    await this.delay();
    return this.lessons.find(l => l.id === id) || null;
  }

  async getLessonWithItems(id: string): Promise<LessonWithItems | null> {
    await this.delay();
    const lesson = this.lessons.find(l => l.id === id);
    if (!lesson) return null;

    const itemIds = this.lessonItemMappings[id] || [];
    const lessonItems = this.lessonItems
      .filter(i => itemIds.includes(i.id))
      .sort((a, b) => a.order - b.order);

    return { ...lesson, lessonItems };
  }

  async getLessonsByCourseId(courseId: string): Promise<LessonWithItems[]> {
    await this.delay();
    const lessonIds = this.courseLessonMappings[courseId] || [];
    return lessonIds.map(lessonId => {
      const lesson = this.lessons.find(l => l.id === lessonId)!;
      const itemIds = this.lessonItemMappings[lessonId] || [];
      const lessonItems = this.lessonItems
        .filter(i => itemIds.includes(i.id))
        .sort((a, b) => a.order - b.order);
      return { ...lesson, lessonItems };
    }).sort((a, b) => a.order - b.order);
  }

  async createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
    await this.delay();
    const lesson: Lesson = {
      ...data,
      id: this.generateId('lesson'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.lessons.push(lesson);
    this.lessonItemMappings[lesson.id] = [];
    
    // If courseId provided, add to course
    if (data.courseId) {
      if (!this.courseLessonMappings[data.courseId]) {
        this.courseLessonMappings[data.courseId] = [];
      }
      this.courseLessonMappings[data.courseId].push(lesson.id);
    }
    
    return lesson;
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson | null> {
    await this.delay();
    const index = this.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    this.lessons[index] = {
      ...this.lessons[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.lessons[index];
  }

  async deleteLesson(id: string): Promise<boolean> {
    await this.delay();
    const index = this.lessons.findIndex(l => l.id === id);
    if (index === -1) return false;
    
    this.lessons.splice(index, 1);
    delete this.lessonItemMappings[id];
    
    // Remove from course mappings
    Object.keys(this.courseLessonMappings).forEach(courseId => {
      this.courseLessonMappings[courseId] = this.courseLessonMappings[courseId].filter(lessonId => lessonId !== id);
    });
    
    return true;
  }

  async addItemsToLesson(lessonId: string, itemIds: string[]): Promise<LessonWithItems | null> {
    await this.delay();
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    if (!this.lessonItemMappings[lessonId]) {
      this.lessonItemMappings[lessonId] = [];
    }

    // Add items that aren't already in the lesson
    const existingIds = new Set(this.lessonItemMappings[lessonId]);
    itemIds.forEach(itemId => {
      if (!existingIds.has(itemId)) {
        this.lessonItemMappings[lessonId].push(itemId);
      }
    });

    return this.getLessonWithItems(lessonId);
  }

  async removeItemFromLesson(lessonId: string, itemId: string): Promise<LessonWithItems | null> {
    await this.delay();
    if (!this.lessonItemMappings[lessonId]) return null;
    
    this.lessonItemMappings[lessonId] = this.lessonItemMappings[lessonId].filter(id => id !== itemId);
    return this.getLessonWithItems(lessonId);
  }

  async reorderLessonItems(lessonId: string, itemIds: string[]): Promise<LessonWithItems | null> {
    await this.delay();
    if (!this.lessonItemMappings[lessonId]) return null;

    // Update order for each item
    itemIds.forEach((itemId, index) => {
      const item = this.lessonItems.find(i => i.id === itemId);
      if (item) {
        item.order = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });

    this.lessonItemMappings[lessonId] = itemIds;
    return this.getLessonWithItems(lessonId);
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    await this.delay();
    return [...this.courses];
  }

  async getCourseById(id: string): Promise<Course | null> {
    await this.delay();
    return this.courses.find(c => c.id === id) || null;
  }

  async getCourseWithDetails(id: string): Promise<CourseWithDetails | null> {
    await this.delay();
    const course = this.courses.find(c => c.id === id);
    if (!course) return null;

    const lessons = await this.getLessonsByCourseId(id);
    const stats = {
      totalEnrollments: Math.floor(Math.random() * 500) + 50,
      totalLessons: lessons.length,
      totalItems: lessons.reduce((sum, l) => sum + l.lessonItems.length, 0),
      averageRating: 4.5 + Math.random() * 0.5,
      totalReviews: Math.floor(Math.random() * 100) + 10,
      completionRate: Math.random() * 0.3 + 0.6,
    };

    return { ...course, lessons, stats };
  }

  async createCourse(data: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    await this.delay();
    const course: Course = {
      ...data,
      id: this.generateId('course'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.courses.push(course);
    this.courseLessonMappings[course.id] = [];
    return course;
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
    await this.delay();
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.courses[index] = {
      ...this.courses[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.courses[index];
  }

  async deleteCourse(id: string): Promise<boolean> {
    await this.delay();
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.courses.splice(index, 1);
    delete this.courseLessonMappings[id];
    return true;
  }

  async addLessonsToCourse(courseId: string, lessonIds: string[]): Promise<CourseWithDetails | null> {
    await this.delay();
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    if (!this.courseLessonMappings[courseId]) {
      this.courseLessonMappings[courseId] = [];
    }

    // Add lessons that aren't already in the course
    const existingIds = new Set(this.courseLessonMappings[courseId]);
    let order = existingIds.size;
    
    lessonIds.forEach(lessonId => {
      if (!existingIds.has(lessonId)) {
        this.courseLessonMappings[courseId].push(lessonId);
        // Update lesson's courseId and order
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
          lesson.courseId = courseId;
          lesson.order = ++order;
          lesson.updatedAt = new Date().toISOString();
        }
      }
    });

    return this.getCourseWithDetails(courseId);
  }

  async removeLessonFromCourse(courseId: string, lessonId: string): Promise<CourseWithDetails | null> {
    await this.delay();
    if (!this.courseLessonMappings[courseId]) return null;
    
    this.courseLessonMappings[courseId] = this.courseLessonMappings[courseId].filter(id => id !== lessonId);
    
    // Remove courseId from lesson
    const lesson = this.lessons.find(l => l.id === lessonId);
    if (lesson) {
      lesson.courseId = undefined;
      lesson.updatedAt = new Date().toISOString();
    }
    
    return this.getCourseWithDetails(courseId);
  }

  async reorderCourseLessons(courseId: string, lessonIds: string[]): Promise<CourseWithDetails | null> {
    await this.delay();
    if (!this.courseLessonMappings[courseId]) return null;

    // Update order for each lesson
    lessonIds.forEach((lessonId, index) => {
      const lesson = this.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.order = index + 1;
        lesson.updatedAt = new Date().toISOString();
      }
    });

    this.courseLessonMappings[courseId] = lessonIds;
    return this.getCourseWithDetails(courseId);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay();
    return {
      totalCourses: this.courses.length,
      totalStudents: mockDashboardStats.totalStudents,
      totalLessons: this.lessons.length,
      totalReviews: mockDashboardStats.totalReviews,
      averageRating: mockDashboardStats.averageRating,
      recentEnrollments: mockDashboardStats.recentEnrollments,
    };
  }
}

// Singleton instance
export const mockDataStore = new MockDataStore();
