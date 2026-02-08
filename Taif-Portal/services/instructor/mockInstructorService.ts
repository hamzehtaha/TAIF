/**
 * Mock Instructor Service
 * Phase 1: Frontend-only implementation with localStorage
 * TODO: API Integration - Replace with real API calls in Phase 2
 */

import {
  Instructor,
  InstructorCourse,
  InstructorLesson,
  InstructorLessonItem,
  CourseReview,
  Category,
  DashboardStats,
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  CreateLessonItemInput,
  UpdateLessonItemInput,
  ReviewStats,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
  CreateVideoInput,
  UpdateVideoInput,
  CreateRichContentInput,
  UpdateRichContentInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '@/types/instructor';
import {
  mockInstructor,
  mockCourses,
  mockCategories,
  mockReviews,
  mockDashboardStats,
  mockVideos,
  mockRichContents,
  mockQuestions,
} from './mockData';

const STORAGE_KEY = 'instructor_portal_data_v2';

interface StoredData {
  instructor: Instructor;
  courses: InstructorCourse[];
  reviews: CourseReview[];
  videos: VideoContent[];
  richContents: RichContent[];
  questions: QuestionWithAnswers[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getStoredData(): StoredData {
  if (typeof window === 'undefined') {
    return {
      instructor: mockInstructor,
      courses: mockCourses,
      reviews: mockReviews,
      videos: mockVideos,
      richContents: mockRichContents,
      questions: mockQuestions,
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // If parsing fails, return mock data
    }
  }
  
  const initialData: StoredData = {
    instructor: mockInstructor,
    courses: mockCourses,
    reviews: mockReviews,
    videos: mockVideos,
    richContents: mockRichContents,
    questions: mockQuestions,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

function saveData(data: StoredData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Simulate network delay
async function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock Instructor Service
 * All methods simulate API calls with localStorage persistence
 */
class MockInstructorService {
  // ============================================
  // Instructor Profile
  // ============================================

  async getProfile(): Promise<Instructor> {
    await delay();
    const data = getStoredData();
    return data.instructor;
  }

  async updateProfile(updates: Partial<Instructor>): Promise<Instructor> {
    await delay();
    const data = getStoredData();
    data.instructor = { ...data.instructor, ...updates };
    saveData(data);
    return data.instructor;
  }

  // ============================================
  // Categories
  // ============================================

  async getCategories(): Promise<Category[]> {
    await delay(100);
    return mockCategories;
  }

  // ============================================
  // Dashboard
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    await delay();
    const data = getStoredData();
    
    const publishedCourses = data.courses.filter(c => c.status === 'published').length;
    const draftCourses = data.courses.filter(c => c.status === 'draft').length;
    const totalStudents = data.courses.reduce((sum, c) => sum + c.stats.totalStudents, 0);
    const totalReviews = data.reviews.length;
    const avgRating = data.reviews.length > 0
      ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
      : 0;

    return {
      ...mockDashboardStats,
      totalCourses: data.courses.length,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalReviews,
      averageRating: Math.round(avgRating * 10) / 10,
    };
  }

  // ============================================
  // Courses CRUD
  // ============================================

  async getCourses(): Promise<InstructorCourse[]> {
    await delay();
    const data = getStoredData();
    return data.courses;
  }

  async getCourseById(id: string): Promise<InstructorCourse | null> {
    await delay();
    const data = getStoredData();
    return data.courses.find(c => c.id === id) || null;
  }

  async createCourse(input: CreateCourseInput): Promise<InstructorCourse> {
    await delay(500);
    const data = getStoredData();
    
    const category = mockCategories.find(c => c.id === input.categoryId);
    const now = new Date().toISOString();
    
    const newCourse: InstructorCourse = {
      id: generateId(),
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail || '/courses/placeholder.jpg',
      categoryId: input.categoryId,
      categoryName: category?.name || 'Unknown',
      status: 'draft',
      instructorId: data.instructor.id,
      lessons: [],
      stats: {
        totalStudents: 0,
        totalLessons: 0,
        totalItems: 0,
        averageRating: 0,
        reviewCount: 0,
        completionRate: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
    
    data.courses.unshift(newCourse);
    saveData(data);
    return newCourse;
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<InstructorCourse | null> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const course = data.courses[index];
    const category = input.categoryId 
      ? mockCategories.find(c => c.id === input.categoryId)
      : null;
    
    const updatedCourse: InstructorCourse = {
      ...course,
      ...input,
      categoryName: category ? category.name : course.categoryName,
      updatedAt: new Date().toISOString(),
    };
    
    data.courses[index] = updatedCourse;
    saveData(data);
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.courses.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    data.courses.splice(index, 1);
    data.reviews = data.reviews.filter(r => r.courseId !== id);
    saveData(data);
    return true;
  }

  async publishCourse(id: string): Promise<InstructorCourse | null> {
    return this.updateCourse(id, { status: 'published' });
  }

  async archiveCourse(id: string): Promise<InstructorCourse | null> {
    return this.updateCourse(id, { status: 'archived' });
  }

  // ============================================
  // Lessons CRUD
  // ============================================

  async getLessonsByCourse(courseId: string): Promise<InstructorLesson[]> {
    await delay();
    const data = getStoredData();
    const course = data.courses.find(c => c.id === courseId);
    return course?.lessons || [];
  }

  async getLessonById(courseId: string, lessonId: string): Promise<InstructorLesson | null> {
    await delay();
    const data = getStoredData();
    const course = data.courses.find(c => c.id === courseId);
    return course?.lessons.find(l => l.id === lessonId) || null;
  }

  async createLesson(input: CreateLessonInput): Promise<InstructorLesson | null> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === input.courseId);
    if (courseIndex === -1) return null;
    
    const course = data.courses[courseIndex];
    const now = new Date().toISOString();
    
    const newLesson: InstructorLesson = {
      id: generateId(),
      title: input.title,
      description: input.description,
      order: course.lessons.length + 1,
      courseId: input.courseId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    
    course.lessons.push(newLesson);
    course.stats.totalLessons = course.lessons.length;
    course.updatedAt = now;
    
    data.courses[courseIndex] = course;
    saveData(data);
    return newLesson;
  }

  async updateLesson(
    courseId: string,
    lessonId: string,
    input: UpdateLessonInput
  ): Promise<InstructorLesson | null> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const now = new Date().toISOString();
    course.lessons[lessonIndex] = {
      ...course.lessons[lessonIndex],
      ...input,
      updatedAt: now,
    };
    course.updatedAt = now;
    
    data.courses[courseIndex] = course;
    saveData(data);
    return course.lessons[lessonIndex];
  }

  async deleteLesson(courseId: string, lessonId: string): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return false;
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return false;
    
    course.lessons.splice(lessonIndex, 1);
    // Reorder remaining lessons
    course.lessons.forEach((l, i) => { l.order = i + 1; });
    course.stats.totalLessons = course.lessons.length;
    course.stats.totalItems = course.lessons.reduce((sum, l) => sum + l.items.length, 0);
    course.updatedAt = new Date().toISOString();
    
    data.courses[courseIndex] = course;
    saveData(data);
    return true;
  }

  async reorderLessons(courseId: string, lessonIds: string[]): Promise<InstructorLesson[]> {
    await delay(300);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return [];
    
    const course = data.courses[courseIndex];
    const lessonMap = new Map(course.lessons.map(l => [l.id, l]));
    
    course.lessons = lessonIds
      .map((id, index) => {
        const lesson = lessonMap.get(id);
        if (lesson) {
          lesson.order = index + 1;
          return lesson;
        }
        return null;
      })
      .filter((l): l is InstructorLesson => l !== null);
    
    course.updatedAt = new Date().toISOString();
    data.courses[courseIndex] = course;
    saveData(data);
    return course.lessons;
  }

  // ============================================
  // Lesson Items CRUD
  // ============================================

  async getItemsByLesson(courseId: string, lessonId: string): Promise<InstructorLessonItem[]> {
    await delay();
    const lesson = await this.getLessonById(courseId, lessonId);
    return lesson?.items || [];
  }

  async createLessonItem(
    courseId: string,
    lessonId: string,
    input: CreateLessonItemInput
  ): Promise<InstructorLessonItem | null> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const lesson = course.lessons[lessonIndex];
    const now = new Date().toISOString();
    
    let newItem: InstructorLessonItem;
    const baseItem = {
      id: generateId(),
      title: input.title,
      order: lesson.items.length + 1,
      lessonId,
      createdAt: now,
      updatedAt: now,
    };
    
    switch (input.type) {
      case 'video':
        if (!input.videoContentId) return null;
        newItem = {
          ...baseItem,
          type: 'video',
          videoContentId: input.videoContentId,
        };
        break;
      case 'rich-content':
        if (!input.richContentId) return null;
        newItem = {
          ...baseItem,
          type: 'rich-content',
          richContentId: input.richContentId,
        };
        break;
      case 'question':
        if (!input.questionId) return null;
        newItem = {
          ...baseItem,
          type: 'question',
          questionId: input.questionId,
        };
        break;
      default:
        return null;
    }
    
    lesson.items.push(newItem);
    course.stats.totalItems = course.lessons.reduce((sum, l) => sum + l.items.length, 0);
    course.updatedAt = now;
    
    data.courses[courseIndex] = course;
    saveData(data);
    return newItem;
  }

  async updateLessonItem(
    courseId: string,
    lessonId: string,
    itemId: string,
    input: UpdateLessonItemInput
  ): Promise<InstructorLessonItem | null> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return null;
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return null;
    
    const lesson = course.lessons[lessonIndex];
    const itemIndex = lesson.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;
    
    const now = new Date().toISOString();
    const currentItem = lesson.items[itemIndex];
    
    lesson.items[itemIndex] = {
      ...currentItem,
      ...input,
      updatedAt: now,
    } as InstructorLessonItem;
    
    course.updatedAt = now;
    data.courses[courseIndex] = course;
    saveData(data);
    return lesson.items[itemIndex];
  }

  async deleteLessonItem(
    courseId: string,
    lessonId: string,
    itemId: string
  ): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return false;
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return false;
    
    const lesson = course.lessons[lessonIndex];
    const itemIndex = lesson.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return false;
    
    lesson.items.splice(itemIndex, 1);
    lesson.items.forEach((item, i) => { item.order = i + 1; });
    course.stats.totalItems = course.lessons.reduce((sum, l) => sum + l.items.length, 0);
    course.updatedAt = new Date().toISOString();
    
    data.courses[courseIndex] = course;
    saveData(data);
    return true;
  }

  async reorderLessonItems(
    courseId: string,
    lessonId: string,
    itemIds: string[]
  ): Promise<InstructorLessonItem[]> {
    await delay(300);
    const data = getStoredData();
    
    const courseIndex = data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return [];
    
    const course = data.courses[courseIndex];
    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return [];
    
    const lesson = course.lessons[lessonIndex];
    const itemMap = new Map(lesson.items.map(i => [i.id, i]));
    
    lesson.items = itemIds
      .map((id, index) => {
        const item = itemMap.get(id);
        if (item) {
          item.order = index + 1;
          return item;
        }
        return null;
      })
      .filter((i): i is InstructorLessonItem => i !== null);
    
    course.updatedAt = new Date().toISOString();
    data.courses[courseIndex] = course;
    saveData(data);
    return lesson.items;
  }

  // ============================================
  // Standalone Videos CRUD
  // ============================================

  async getVideos(): Promise<VideoContent[]> {
    await delay();
    const data = getStoredData();
    return data.videos;
  }

  async getVideoById(id: string): Promise<VideoContent | null> {
    await delay();
    const data = getStoredData();
    return data.videos.find(v => v.id === id) || null;
  }

  async createVideo(input: CreateVideoInput): Promise<VideoContent> {
    await delay(500);
    const data = getStoredData();
    const now = new Date().toISOString();
    
    const newVideo: VideoContent = {
      id: generateId(),
      title: input.title,
      description: input.description,
      videoUrl: input.videoUrl,
      duration: input.duration,
      thumbnailUrl: input.thumbnailUrl,
      instructorId: data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    
    data.videos.unshift(newVideo);
    saveData(data);
    return newVideo;
  }

  async updateVideo(id: string, input: UpdateVideoInput): Promise<VideoContent | null> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.videos.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    data.videos[index] = {
      ...data.videos[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    saveData(data);
    return data.videos[index];
  }

  async deleteVideo(id: string): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.videos.findIndex(v => v.id === id);
    if (index === -1) return false;
    
    data.videos.splice(index, 1);
    saveData(data);
    return true;
  }

  // ============================================
  // Standalone Rich Content CRUD
  // ============================================

  async getRichContents(): Promise<RichContent[]> {
    await delay();
    const data = getStoredData();
    return data.richContents;
  }

  async getRichContentById(id: string): Promise<RichContent | null> {
    await delay();
    const data = getStoredData();
    return data.richContents.find(r => r.id === id) || null;
  }

  async createRichContent(input: CreateRichContentInput): Promise<RichContent> {
    await delay(500);
    const data = getStoredData();
    const now = new Date().toISOString();
    
    const newContent: RichContent = {
      id: generateId(),
      title: input.title,
      description: input.description,
      htmlContent: input.htmlContent,
      instructorId: data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    
    data.richContents.unshift(newContent);
    saveData(data);
    return newContent;
  }

  async updateRichContent(id: string, input: UpdateRichContentInput): Promise<RichContent | null> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.richContents.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    data.richContents[index] = {
      ...data.richContents[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    saveData(data);
    return data.richContents[index];
  }

  async deleteRichContent(id: string): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.richContents.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    data.richContents.splice(index, 1);
    saveData(data);
    return true;
  }

  // ============================================
  // Standalone Questions CRUD
  // ============================================

  async getQuestions(): Promise<QuestionWithAnswers[]> {
    await delay();
    const data = getStoredData();
    return data.questions;
  }

  async getQuestionById(id: string): Promise<QuestionWithAnswers | null> {
    await delay();
    const data = getStoredData();
    return data.questions.find(q => q.id === id) || null;
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers> {
    await delay(500);
    const data = getStoredData();
    const now = new Date().toISOString();
    
    const newQuestion: QuestionWithAnswers = {
      id: generateId(),
      text: input.text,
      description: input.description,
      type: input.type || 'multiple-choice',
      answers: input.answers.map((a, index) => ({
        id: generateId(),
        text: a.text,
        isCorrect: a.isCorrect,
        order: index + 1,
      })),
      instructorId: data.instructor.id,
      createdAt: now,
      updatedAt: now,
    };
    
    data.questions.unshift(newQuestion);
    saveData(data);
    return newQuestion;
  }

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    
    const updatedQuestion: QuestionWithAnswers = {
      ...data.questions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    if (input.answers) {
      updatedQuestion.answers = input.answers;
    }
    
    data.questions[index] = updatedQuestion;
    saveData(data);
    return updatedQuestion;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    await delay(500);
    const data = getStoredData();
    
    const index = data.questions.findIndex(q => q.id === id);
    if (index === -1) return false;
    
    data.questions.splice(index, 1);
    saveData(data);
    return true;
  }

  // ============================================
  // Reviews (Read-only for instructors)
  // ============================================

  async getReviewsByCourse(courseId: string): Promise<CourseReview[]> {
    await delay();
    const data = getStoredData();
    return data.reviews.filter(r => r.courseId === courseId);
  }

  async getReviewStats(courseId: string): Promise<ReviewStats> {
    await delay();
    const data = getStoredData();
    const courseReviews = data.reviews.filter(r => r.courseId === courseId);
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    courseReviews.forEach(r => {
      const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });
    
    const avgRating = courseReviews.length > 0
      ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
      : 0;
    
    return {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: courseReviews.length,
      ratingDistribution: distribution,
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  async resetToMockData(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const mockInstructorService = new MockInstructorService();
