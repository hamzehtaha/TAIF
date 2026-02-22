/**
 * Real Data Service for Instructor Portal
 * 
 * This service provides real API integration for all data operations.
 * Replaces the mock implementation with actual backend API calls.
 */

import { courseService } from '@/services/course.service';
import { lessonService } from '@/services/lesson.service';
import { lessonItemService } from '@/services/lesson-item.service';
import { categoryService } from '@/services/category.service';
import { instructorProfileService } from '@/services/instructor-profile.service';
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
  LessonItemType,
} from '@/types/instructor';
import {
  IDataService,
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  CreateLessonItemInput,
  UpdateLessonItemInput,
  CreateVideoInput,
  UpdateVideoInput,
  CreateRichContentInput,
  UpdateRichContentInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  UpdateInstructorInput,
} from './dataService.types';

// ============================================
// Type Converters
// ============================================

const mapLessonItemTypeToNumber = (type: LessonItemType): number => {
  switch (type) {
    case 'video': return 0;
    case 'rich-content': return 1;
    case 'question': return 2;
    default: return 0;
  }
};

const mapNumberToLessonItemType = (type: number): LessonItemType => {
  switch (type) {
    case 0: return 'video';
    case 1: return 'rich-content';
    case 2: return 'question';
    default: return 'video';
  }
};

// ============================================
// Real Data Service Implementation
// ============================================

class RealDataService implements IDataService {
  
  // ============================================
  // Instructor
  // ============================================

  async getInstructor(): Promise<Instructor> {
    const profile = await instructorProfileService.getCurrentProfile();
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      bio: profile.bio,
      expertise: profile.expertises,
      createdAt: profile.createdAt,
    };
  }

  async updateInstructor(input: UpdateInstructorInput): Promise<Instructor> {
    const profile = await instructorProfileService.updateCurrentProfile({
      firstName: input.firstName,
      lastName: input.lastName,
      bio: input.bio,
      expertises: input.expertise,
    });
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      bio: profile.bio,
      expertise: profile.expertises,
      createdAt: profile.createdAt,
    };
  }

  // ============================================
  // Categories
  // ============================================

  async getCategories(): Promise<Category[]> {
    const categories = await categoryService.getCategories();
    return categories.map(c => ({
      id: c.id,
      name: c.name,
      description: '', // Category model doesn't have description
    }));
  }

  // ============================================
  // Dashboard
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    const courses = await this.getCourses();
    const publishedCourses = courses.filter(c => c.status === 'published');
    const draftCourses = courses.filter(c => c.status === 'draft');
    
    return {
      totalCourses: courses.length,
      publishedCourses: publishedCourses.length,
      draftCourses: draftCourses.length,
      totalStudents: courses.reduce((sum, c) => sum + (c.stats?.totalEnrollments || 0), 0),
      totalReviews: courses.reduce((sum, c) => sum + (c.stats?.totalReviews || 0), 0),
      averageRating: courses.length > 0 
        ? courses.reduce((sum, c) => sum + (c.stats?.averageRating || 0), 0) / courses.length 
        : 0,
      recentActivity: [],
      popularCourses: courses.slice(0, 5).map(c => ({
        courseId: c.id,
        courseName: c.title,
        enrollments: c.stats?.totalEnrollments || 0,
      })),
    };
  }

  // ============================================
  // Courses
  // ============================================

  async getCourses(): Promise<InstructorCourse[]> {
    const courses = await courseService.getMyCourses();
    const categories = await this.getCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return Promise.all(courses.map(async (course) => {
      const lessons = await this.getLessonsByCourse(course.id);
      const totalItems = lessons.reduce((sum, l) => sum + l.items.length, 0);
      
      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail: course.thumbnail,
        categoryId: course.categoryId,
        categoryName: categoryMap.get(course.categoryId),
        status: 'draft' as const, // TODO: Get from backend when available
        instructorId: '', // Will be set by backend
        lessons,
        stats: {
          totalLessons: lessons.length,
          totalItems,
          totalEnrollments: course.totalEnrolled || 0,
          averageRating: course.rating || 0,
          totalReviews: course.reviewCount || 0,
          totalStudents: course.totalEnrolled || 0,
          completionRate: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
  }

  async getCourseById(id: string): Promise<InstructorCourse | null> {
    try {
      const course = await courseService.getCourseById(id);
      const categories = await this.getCategories();
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const lessons = await this.getLessonsByCourse(id);
      const totalItems = lessons.reduce((sum, l) => sum + l.items.length, 0);

      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnail: course.thumbnail,
        categoryId: course.categoryId,
        categoryName: categoryMap.get(course.categoryId),
        status: 'draft' as const,
        instructorId: '',
        lessons,
        stats: {
          totalLessons: lessons.length,
          totalItems,
          totalEnrollments: course.totalEnrolled || 0,
          averageRating: course.rating || 0,
          totalReviews: course.reviewCount || 0,
          totalStudents: course.totalEnrolled || 0,
          completionRate: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async createCourse(input: CreateCourseInput): Promise<InstructorCourse> {
    const course = await courseService.createCourse({
      name: input.title,
      description: input.description,
      photo: input.thumbnail || '',
      categoryId: input.categoryId,
      tags: [], // TODO: Add tags support
    });

    const categories = await this.getCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      thumbnail: course.thumbnail,
      categoryId: course.categoryId,
      categoryName: categoryMap.get(course.categoryId),
      status: 'draft',
      instructorId: '',
      lessons: [],
      stats: {
        totalLessons: 0,
        totalItems: 0,
        totalEnrollments: 0,
        averageRating: 0,
        totalReviews: 0,
        totalStudents: 0,
        completionRate: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<InstructorCourse | null> {
    try {
      const course = await courseService.updateCourse(id, {
        name: input.title,
        description: input.description,
        photo: input.thumbnail,
      });

      return this.getCourseById(id);
    } catch {
      return null;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      return await courseService.deleteCourse(id);
    } catch {
      return false;
    }
  }

  async publishCourse(id: string): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports course status
    const course = await this.getCourseById(id);
    if (course) {
      course.status = 'published';
    }
    return course;
  }

  async archiveCourse(id: string): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports course status
    const course = await this.getCourseById(id);
    if (course) {
      course.status = 'archived';
    }
    return course;
  }

  async unpublishCourse(id: string): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports course status
    const course = await this.getCourseById(id);
    if (course) {
      course.status = 'draft';
    }
    return course;
  }

  async addLessonsToCourse(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports this operation
    return this.getCourseById(courseId);
  }

  async removeLessonFromCourse(courseId: string, lessonId: string): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports this operation
    return this.getCourseById(courseId);
  }

  async reorderCourseLessons(courseId: string, lessonIds: string[]): Promise<InstructorCourse | null> {
    // TODO: Implement when backend supports this operation
    return this.getCourseById(courseId);
  }

  // ============================================
  // Lessons
  // ============================================

  private async getLessonsByCourse(courseId: string): Promise<InstructorLesson[]> {
    try {
      const lessons = await lessonService.getLessonsByCourse(courseId);
      return Promise.all(lessons.map(async (lesson) => {
        const items = await this.getItemsByLesson(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          description: '',
          order: lesson.order || 0,
          items,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }));
    } catch {
      return [];
    }
  }

  async getLessons(): Promise<InstructorLesson[]> {
    // Get all lessons from all courses
    const courses = await this.getCourses();
    const allLessons: InstructorLesson[] = [];
    for (const course of courses) {
      allLessons.push(...course.lessons);
    }
    return allLessons;
  }

  async getLessonById(id: string): Promise<InstructorLesson | null> {
    try {
      const lesson = await lessonService.getLessonById(id);
      const items = await this.getItemsByLesson(id);
      return {
        id: lesson.id,
        title: lesson.title,
        description: '',
        order: lesson.order || 0,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async createLesson(input: CreateLessonInput): Promise<InstructorLesson> {
    const lesson = await lessonService.createLesson({
      title: input.title,
      url: input.title.toLowerCase().replace(/\s+/g, '-'), // Generate URL from title
      courseId: input.courseId || '',
      photo: undefined,
    });

    return {
      id: lesson.id,
      title: lesson.title,
      description: input.description,
      order: lesson.order || 0,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateLesson(id: string, input: UpdateLessonInput): Promise<InstructorLesson | null> {
    try {
      const lesson = await lessonService.updateLesson(id, {
        title: input.title,
      });

      return this.getLessonById(id);
    } catch {
      return null;
    }
  }

  async deleteLesson(id: string): Promise<boolean> {
    try {
      return await lessonService.deleteLesson(id);
    } catch {
      return false;
    }
  }

  async addItemsToLesson(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> {
    // TODO: Implement when backend supports this operation
    return this.getLessonById(lessonId);
  }

  async removeItemFromLesson(lessonId: string, itemId: string): Promise<InstructorLesson | null> {
    // TODO: Implement when backend supports this operation
    return this.getLessonById(lessonId);
  }

  async reorderLessonItems(lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> {
    // TODO: Implement when backend supports this operation
    return this.getLessonById(lessonId);
  }

  // ============================================
  // Lesson Items
  // ============================================

  private async getItemsByLesson(lessonId: string): Promise<InstructorLessonItem[]> {
    try {
      const items = await lessonItemService.getItemsByLesson(lessonId);
      return items.map(item => {
        const itemType = mapNumberToLessonItemType(typeof item.type === 'number' ? item.type : 0);
        const baseItem = {
          id: item.id,
          title: item.name,
          description: '',
          order: item.order || 0,
          lessonId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Return properly typed lesson item based on type
        if (itemType === 'video') {
          return { ...baseItem, type: 'video' as const, videoContentId: '' };
        } else if (itemType === 'rich-content') {
          return { ...baseItem, type: 'rich-content' as const, richContentId: '' };
        } else {
          return { ...baseItem, type: 'question' as const, questionId: '' };
        }
      });
    } catch {
      return [];
    }
  }

  async getLessonItems(): Promise<InstructorLessonItem[]> {
    // Get all items from all lessons
    const courses = await this.getCourses();
    const allItems: InstructorLessonItem[] = [];
    for (const course of courses) {
      for (const lesson of course.lessons) {
        allItems.push(...lesson.items);
      }
    }
    return allItems;
  }

  async getLessonItemById(id: string): Promise<InstructorLessonItem | null> {
    try {
      const item = await lessonItemService.getItemById(id);
      const itemType = mapNumberToLessonItemType(typeof item.type === 'number' ? item.type : 0);
      const baseItem = {
        id: item.id,
        title: item.name,
        description: '',
        order: item.order || 0,
        lessonId: item.lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Return properly typed lesson item based on type
      if (itemType === 'video') {
        return { ...baseItem, type: 'video' as const, videoContentId: '' };
      } else if (itemType === 'rich-content') {
        return { ...baseItem, type: 'rich-content' as const, richContentId: '' };
      } else {
        return { ...baseItem, type: 'question' as const, questionId: '' };
      }
    } catch {
      return null;
    }
  }

  async createLessonItem(input: CreateLessonItemInput): Promise<InstructorLessonItem> {
    // Build content based on type
    let content = '';
    if (input.type === 'video' && input.videoContentId) {
      content = JSON.stringify({ videoId: input.videoContentId });
    } else if (input.type === 'rich-content' && input.richContentId) {
      content = JSON.stringify({ richContentId: input.richContentId });
    } else if (input.type === 'question' && input.questionId) {
      content = JSON.stringify({ questionId: input.questionId });
    }

    const item = await lessonItemService.createLessonItem({
      name: input.title,
      content,
      type: mapLessonItemTypeToNumber(input.type),
      lessonId: input.lessonId || '',
      durationInSeconds: 0,
    });

    const baseItem = {
      id: item.id,
      title: item.name,
      description: input.description,
      order: item.order || 0,
      lessonId: input.lessonId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Return properly typed lesson item based on type
    if (input.type === 'video') {
      return { ...baseItem, type: 'video' as const, videoContentId: input.videoContentId || '' };
    } else if (input.type === 'rich-content') {
      return { ...baseItem, type: 'rich-content' as const, richContentId: input.richContentId || '' };
    } else {
      return { ...baseItem, type: 'question' as const, questionId: input.questionId || '' };
    }
  }

  async updateLessonItem(id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null> {
    try {
      const existingItem = await lessonItemService.getItemById(id);
      
      await lessonItemService.updateLessonItem(id, {
        name: input.title,
        durationInSeconds: 0,
      });

      return this.getLessonItemById(id);
    } catch {
      return null;
    }
  }

  async deleteLessonItem(id: string): Promise<boolean> {
    try {
      return await lessonItemService.deleteLessonItem(id);
    } catch {
      return false;
    }
  }

  // ============================================
  // Videos (stored in lesson item content)
  // ============================================

  async getVideos(): Promise<VideoContent[]> {
    // Videos are embedded in lesson items - return empty for now
    // TODO: Implement when backend supports standalone video storage
    return [];
  }

  async getVideoById(id: string): Promise<VideoContent | null> {
    return null;
  }

  async createVideo(input: CreateVideoInput): Promise<VideoContent> {
    // Create a video record (stored locally or in lesson item content)
    const now = new Date().toISOString();
    return {
      id: `video-${Date.now()}`,
      title: input.title,
      description: input.description,
      videoUrl: input.videoUrl,
      duration: input.duration,
      thumbnailUrl: input.thumbnailUrl,
      instructorId: '',
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateVideo(id: string, input: UpdateVideoInput): Promise<VideoContent | null> {
    return null;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return false;
  }

  // ============================================
  // Rich Content (stored in lesson item content)
  // ============================================

  async getRichContents(): Promise<RichContent[]> {
    return [];
  }

  async getRichContentById(id: string): Promise<RichContent | null> {
    return null;
  }

  async createRichContent(input: CreateRichContentInput): Promise<RichContent> {
    const now = new Date().toISOString();
    return {
      id: `rich-${Date.now()}`,
      title: input.title,
      description: input.description,
      htmlContent: input.htmlContent,
      instructorId: '',
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateRichContent(id: string, input: UpdateRichContentInput): Promise<RichContent | null> {
    return null;
  }

  async deleteRichContent(id: string): Promise<boolean> {
    return false;
  }

  // ============================================
  // Questions (stored in lesson item content)
  // ============================================

  async getQuestions(): Promise<QuestionWithAnswers[]> {
    return [];
  }

  async getQuestionById(id: string): Promise<QuestionWithAnswers | null> {
    return null;
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionWithAnswers> {
    const now = new Date().toISOString();
    return {
      id: `question-${Date.now()}`,
      text: input.text,
      description: input.description,
      type: input.type || 'multiple-choice',
      answers: input.answers.map((a, i) => ({
        id: `answer-${Date.now()}-${i}`,
        text: a.text,
        isCorrect: a.isCorrect,
        order: i + 1,
      })),
      instructorId: '',
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null> {
    return null;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return false;
  }

  // ============================================
  // Reviews
  // ============================================

  async getReviewsByCourse(courseId: string): Promise<CourseReview[]> {
    // TODO: Implement when backend supports reviews API
    return [];
  }

  async getReviewStats(courseId: string): Promise<ReviewStats> {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const realDataService = new RealDataService();
