"use client";

/**
 * Instructor Context Provider
 * Phase 1: Frontend-only state management
 * TODO: API Integration - Connect to real APIs in Phase 2
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  Instructor,
  InstructorCourse,
  InstructorLesson,
  InstructorLessonItem,
  DashboardStats,
  Category,
  VideoContent,
  RichContent,
  QuestionWithAnswers,
  LessonItemType,
} from '@/types/instructor';
import { instructorProfileService } from '@/services/instructor-profile.service';
import { courseService } from '@/services/course.service';
import { lessonService } from '@/services/lesson.service';
import { lessonItemService } from '@/services/lesson-item.service';
import { categoryService } from '@/services/category.service';
import { Course } from '@/models/course.model';
import { Lesson } from '@/models/lesson.model';
import { LessonItem } from '@/models/lesson-item.model';
import { LessonItemType as LessonItemTypeEnum } from '@/enums/lesson-item-type.enum';

// ============================================
// Input Types for Create/Update Operations
// ============================================

export interface CreateCourseInput {
  title: string;
  description: string;
  categoryId: string;
  thumbnail?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  categoryId?: string;
  thumbnail?: string;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  courseId?: string;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
}

export interface CreateLessonItemInput {
  title: string;
  description?: string;
  type: LessonItemType;
  lessonId?: string;
  content?: string;
  durationInSeconds?: number;
}

export interface UpdateLessonItemInput {
  title?: string;
  description?: string;
  content?: string;
  durationInSeconds?: number;
}

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

export interface CreateQuestionInput {
  text: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers: { text: string; isCorrect: boolean }[];
}

export interface UpdateQuestionInput {
  text?: string;
  description?: string;
  type?: 'multiple-choice' | 'true-false';
  answers?: { id: string; text: string; isCorrect: boolean; order: number }[];
}

// ============================================
// Type Mappers
// ============================================

const mapLessonItemTypeToInstructor = (type: LessonItemTypeEnum): LessonItemType => {
  switch (type) {
    case 'video': return 'video';
    case 'text': return 'rich-content';
    case 'question': return 'question';
    default: return 'video';
  }
};

const mapLessonItemTypeToBackend = (type: LessonItemType): number => {
  switch (type) {
    case 'video': return 0;
    case 'rich-content': return 1;
    case 'question': return 2;
    default: return 0;
  }
};

const mapCourseToInstructor = (course: Course, lessons: InstructorLesson[] = []): InstructorCourse => {
  const totalItems = lessons.reduce((sum, l) => sum + l.items.length, 0);
  return {
    id: course.id,
    title: course.title,
    description: course.description || '',
    thumbnail: course.thumbnail || '',
    categoryId: course.categoryId,
    categoryName: course.categoryName || '',
    status: 'draft',
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
};

const mapLessonToInstructor = (lesson: Lesson, items: InstructorLessonItem[] = []): InstructorLesson => {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description || '',
    order: lesson.order || 0,
    courseId: lesson.courseId,
    items,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const mapLessonItemToInstructor = (item: LessonItem): InstructorLessonItem => {
  const type = mapLessonItemTypeToInstructor(item.type);
  const baseItem = {
    id: item.id,
    title: item.name,
    description: '',
    order: item.order || 0,
    lessonId: item.lessonId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  if (type === 'video') {
    return { ...baseItem, type: 'video' as const, videoContentId: '' };
  } else if (type === 'rich-content') {
    return { ...baseItem, type: 'rich-content' as const, richContentId: '' };
  } else {
    return { ...baseItem, type: 'question' as const, questionId: '' };
  }
};

// ============================================
// State Types
// ============================================

interface InstructorState {
  instructor: Instructor | null;
  courses: InstructorCourse[];
  categories: Category[];
  dashboardStats: DashboardStats | null;
  currentCourse: InstructorCourse | null;
  currentLesson: InstructorLesson | null;
  // Standalone content items
  videos: VideoContent[];
  richContents: RichContent[];
  questions: QuestionWithAnswers[];
  // Standalone lesson items and lessons
  lessonItems: InstructorLessonItem[];
  lessons: InstructorLesson[];
  isLoading: boolean;
  error: string | null;
  unsavedChanges: boolean;
}

type InstructorAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INSTRUCTOR'; payload: Instructor }
  | { type: 'SET_COURSES'; payload: InstructorCourse[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'SET_CURRENT_COURSE'; payload: InstructorCourse | null }
  | { type: 'SET_CURRENT_LESSON'; payload: InstructorLesson | null }
  | { type: 'ADD_COURSE'; payload: InstructorCourse }
  | { type: 'UPDATE_COURSE'; payload: InstructorCourse }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'ADD_LESSON'; payload: { courseId: string; lesson: InstructorLesson } }
  | { type: 'UPDATE_LESSON'; payload: { courseId: string; lesson: InstructorLesson } }
  | { type: 'DELETE_LESSON'; payload: { courseId: string; lessonId: string } }
  | { type: 'REORDER_LESSONS'; payload: { courseId: string; lessons: InstructorLesson[] } }
  | { type: 'ADD_LESSON_ITEM'; payload: { courseId: string; lessonId: string; item: InstructorLessonItem } }
  | { type: 'UPDATE_LESSON_ITEM'; payload: { courseId: string; lessonId: string; item: InstructorLessonItem } }
  | { type: 'DELETE_LESSON_ITEM'; payload: { courseId: string; lessonId: string; itemId: string } }
  | { type: 'REORDER_LESSON_ITEMS'; payload: { courseId: string; lessonId: string; items: InstructorLessonItem[] } }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  // Standalone lesson items and lessons
  | { type: 'SET_LESSON_ITEMS'; payload: InstructorLessonItem[] }
  | { type: 'ADD_STANDALONE_LESSON_ITEM'; payload: InstructorLessonItem }
  | { type: 'UPDATE_STANDALONE_LESSON_ITEM'; payload: InstructorLessonItem }
  | { type: 'DELETE_STANDALONE_LESSON_ITEM'; payload: string }
  | { type: 'SET_LESSONS'; payload: InstructorLesson[] }
  | { type: 'ADD_STANDALONE_LESSON'; payload: InstructorLesson }
  | { type: 'UPDATE_STANDALONE_LESSON'; payload: InstructorLesson }
  | { type: 'DELETE_STANDALONE_LESSON'; payload: string }
  // Standalone content actions
  | { type: 'SET_VIDEOS'; payload: VideoContent[] }
  | { type: 'ADD_VIDEO'; payload: VideoContent }
  | { type: 'UPDATE_VIDEO'; payload: VideoContent }
  | { type: 'DELETE_VIDEO'; payload: string }
  | { type: 'SET_RICH_CONTENTS'; payload: RichContent[] }
  | { type: 'ADD_RICH_CONTENT'; payload: RichContent }
  | { type: 'UPDATE_RICH_CONTENT'; payload: RichContent }
  | { type: 'DELETE_RICH_CONTENT'; payload: string }
  | { type: 'SET_QUESTIONS'; payload: QuestionWithAnswers[] }
  | { type: 'ADD_QUESTION'; payload: QuestionWithAnswers }
  | { type: 'UPDATE_QUESTION'; payload: QuestionWithAnswers }
  | { type: 'DELETE_QUESTION'; payload: string };

const initialState: InstructorState = {
  instructor: null,
  courses: [],
  categories: [],
  dashboardStats: null,
  currentCourse: null,
  currentLesson: null,
  videos: [],
  richContents: [],
  questions: [],
  lessonItems: [],
  lessons: [],
  isLoading: false,
  error: null,
  unsavedChanges: false,
};

// ============================================
// Reducer
// ============================================

function instructorReducer(state: InstructorState, action: InstructorAction): InstructorState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_INSTRUCTOR':
      return { ...state, instructor: action.payload };
    
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    
    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload };
    
    case 'SET_CURRENT_LESSON':
      return { ...state, currentLesson: action.payload };
    
    case 'ADD_COURSE':
      return { ...state, courses: [action.payload, ...state.courses] };
    
    case 'UPDATE_COURSE': {
      const updatedCourses = state.courses.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      return {
        ...state,
        courses: updatedCourses,
        currentCourse: state.currentCourse?.id === action.payload.id ? action.payload : state.currentCourse,
      };
    }
    
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(c => c.id !== action.payload),
        currentCourse: state.currentCourse?.id === action.payload ? null : state.currentCourse,
      };
    
    case 'ADD_LESSON': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const updatedCourse = {
        ...course,
        lessons: [...course.lessons, action.payload.lesson],
        stats: { ...course.stats, totalLessons: course.lessons.length + 1 },
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
      };
    }
    
    case 'UPDATE_LESSON': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const updatedCourse = {
        ...course,
        lessons: course.lessons.map(l =>
          l.id === action.payload.lesson.id ? action.payload.lesson : l
        ),
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === action.payload.lesson.id ? action.payload.lesson : state.currentLesson,
      };
    }
    
    case 'DELETE_LESSON': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const updatedLessons = course.lessons.filter(l => l.id !== action.payload.lessonId);
      const updatedCourse = {
        ...course,
        lessons: updatedLessons,
        stats: { ...course.stats, totalLessons: updatedLessons.length },
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === action.payload.lessonId ? null : state.currentLesson,
      };
    }
    
    case 'REORDER_LESSONS': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const updatedCourse = { ...course, lessons: action.payload.lessons };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
      };
    }
    
    case 'ADD_LESSON_ITEM': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const lesson = course.lessons.find(l => l.id === action.payload.lessonId);
      if (!lesson) return state;
      
      const updatedLesson = { ...lesson, items: [...lesson.items, action.payload.item] };
      const updatedCourse = {
        ...course,
        lessons: course.lessons.map(l => l.id === lesson.id ? updatedLesson : l),
        stats: { ...course.stats, totalItems: course.stats.totalItems + 1 },
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === lesson.id ? updatedLesson : state.currentLesson,
      };
    }
    
    case 'UPDATE_LESSON_ITEM': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const lesson = course.lessons.find(l => l.id === action.payload.lessonId);
      if (!lesson) return state;
      
      const updatedLesson = {
        ...lesson,
        items: lesson.items.map(i => i.id === action.payload.item.id ? action.payload.item : i),
      };
      const updatedCourse = {
        ...course,
        lessons: course.lessons.map(l => l.id === lesson.id ? updatedLesson : l),
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === lesson.id ? updatedLesson : state.currentLesson,
      };
    }
    
    case 'DELETE_LESSON_ITEM': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const lesson = course.lessons.find(l => l.id === action.payload.lessonId);
      if (!lesson) return state;
      
      const updatedLesson = {
        ...lesson,
        items: lesson.items.filter(i => i.id !== action.payload.itemId),
      };
      const updatedCourse = {
        ...course,
        lessons: course.lessons.map(l => l.id === lesson.id ? updatedLesson : l),
        stats: { ...course.stats, totalItems: course.stats.totalItems - 1 },
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === lesson.id ? updatedLesson : state.currentLesson,
      };
    }
    
    case 'REORDER_LESSON_ITEMS': {
      const course = state.courses.find(c => c.id === action.payload.courseId);
      if (!course) return state;
      
      const lesson = course.lessons.find(l => l.id === action.payload.lessonId);
      if (!lesson) return state;
      
      const updatedLesson = { ...lesson, items: action.payload.items };
      const updatedCourse = {
        ...course,
        lessons: course.lessons.map(l => l.id === lesson.id ? updatedLesson : l),
      };
      
      return {
        ...state,
        courses: state.courses.map(c => c.id === course.id ? updatedCourse : c),
        currentCourse: state.currentCourse?.id === course.id ? updatedCourse : state.currentCourse,
        currentLesson: state.currentLesson?.id === lesson.id ? updatedLesson : state.currentLesson,
      };
    }
    
    case 'SET_UNSAVED_CHANGES':
      return { ...state, unsavedChanges: action.payload };
    
    // Standalone Videos
    case 'SET_VIDEOS':
      return { ...state, videos: action.payload };
    
    case 'ADD_VIDEO':
      return { ...state, videos: [action.payload, ...state.videos] };
    
    case 'UPDATE_VIDEO':
      return { ...state, videos: state.videos.map(v => v.id === action.payload.id ? action.payload : v) };
    
    case 'DELETE_VIDEO':
      return { ...state, videos: state.videos.filter(v => v.id !== action.payload) };
    
    // Standalone Rich Contents
    case 'SET_RICH_CONTENTS':
      return { ...state, richContents: action.payload };
    
    case 'ADD_RICH_CONTENT':
      return { ...state, richContents: [action.payload, ...state.richContents] };
    
    case 'UPDATE_RICH_CONTENT':
      return { ...state, richContents: state.richContents.map(r => r.id === action.payload.id ? action.payload : r) };
    
    case 'DELETE_RICH_CONTENT':
      return { ...state, richContents: state.richContents.filter(r => r.id !== action.payload) };
    
    // Standalone Questions
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    
    case 'ADD_QUESTION':
      return { ...state, questions: [action.payload, ...state.questions] };
    
    case 'UPDATE_QUESTION':
      return { ...state, questions: state.questions.map(q => q.id === action.payload.id ? action.payload : q) };
    
    case 'DELETE_QUESTION':
      return { ...state, questions: state.questions.filter(q => q.id !== action.payload) };
    
    // Standalone Lesson Items
    case 'SET_LESSON_ITEMS':
      return { ...state, lessonItems: action.payload };
    
    case 'ADD_STANDALONE_LESSON_ITEM':
      return { ...state, lessonItems: [action.payload, ...state.lessonItems] };
    
    case 'UPDATE_STANDALONE_LESSON_ITEM':
      return { ...state, lessonItems: state.lessonItems.map(i => i.id === action.payload.id ? action.payload : i) };
    
    case 'DELETE_STANDALONE_LESSON_ITEM':
      return { ...state, lessonItems: state.lessonItems.filter(i => i.id !== action.payload) };
    
    // Standalone Lessons
    case 'SET_LESSONS':
      return { ...state, lessons: action.payload };
    
    case 'ADD_STANDALONE_LESSON':
      return { ...state, lessons: [action.payload, ...state.lessons] };
    
    case 'UPDATE_STANDALONE_LESSON':
      return { ...state, lessons: state.lessons.map(l => l.id === action.payload.id ? action.payload : l) };
    
    case 'DELETE_STANDALONE_LESSON':
      return { ...state, lessons: state.lessons.filter(l => l.id !== action.payload) };
    
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface InstructorContextValue extends InstructorState {
  // Data loading
  loadInstructor: () => Promise<void>;
  loadCourses: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadCourse: (courseId: string) => Promise<void>;
  
  // Course actions
  createCourse: (input: CreateCourseInput) => Promise<InstructorCourse | null>;
  updateCourse: (id: string, input: UpdateCourseInput) => Promise<InstructorCourse | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  publishCourse: (id: string) => Promise<boolean>;
  archiveCourse: (id: string) => Promise<boolean>;
  unpublishCourse: (id: string) => Promise<boolean>;
  
  // Lesson actions (for courses)
  createLesson: (input: CreateLessonInput) => Promise<InstructorLesson | null>;
  updateLesson: (courseId: string, lessonId: string, input: UpdateLessonInput) => Promise<InstructorLesson | null>;
  deleteLesson: (courseId: string, lessonId: string) => Promise<boolean>;
  reorderLessons: (courseId: string, lessonIds: string[]) => Promise<void>;
  addLessonsToCourse: (courseId: string, lessonIds: string[]) => Promise<InstructorCourse | null>;
  removeLessonFromCourse: (courseId: string, lessonId: string) => Promise<InstructorCourse | null>;
  
  // Lesson item actions
  createLessonItem: (courseId: string, lessonId: string, input: CreateLessonItemInput) => Promise<InstructorLessonItem | null>;
  updateLessonItem: (courseId: string, lessonId: string, itemId: string, input: UpdateLessonItemInput) => Promise<InstructorLessonItem | null>;
  deleteLessonItem: (courseId: string, lessonId: string, itemId: string) => Promise<boolean>;
  reorderLessonItems: (courseId: string, lessonId: string, itemIds: string[]) => Promise<void>;
  
  // Standalone Video actions
  loadVideos: () => Promise<void>;
  createVideo: (input: CreateVideoInput) => Promise<VideoContent | null>;
  updateVideo: (id: string, input: UpdateVideoInput) => Promise<VideoContent | null>;
  deleteVideo: (id: string) => Promise<boolean>;
  
  // Standalone Rich Content actions
  loadRichContents: () => Promise<void>;
  createRichContent: (input: CreateRichContentInput) => Promise<RichContent | null>;
  updateRichContent: (id: string, input: UpdateRichContentInput) => Promise<RichContent | null>;
  deleteRichContent: (id: string) => Promise<boolean>;
  
  // Standalone Question actions
  loadQuestions: () => Promise<void>;
  createQuestion: (input: CreateQuestionInput) => Promise<QuestionWithAnswers | null>;
  updateQuestion: (id: string, input: UpdateQuestionInput) => Promise<QuestionWithAnswers | null>;
  deleteQuestion: (id: string) => Promise<boolean>;
  
  // Standalone Lesson Item actions
  loadLessonItems: () => Promise<void>;
  createStandaloneLessonItem: (input: CreateLessonItemInput) => Promise<InstructorLessonItem | null>;
  updateStandaloneLessonItem: (id: string, input: UpdateLessonItemInput) => Promise<InstructorLessonItem | null>;
  deleteStandaloneLessonItem: (id: string) => Promise<boolean>;
  
  // Standalone Lesson actions
  loadLessons: () => Promise<void>;
  createStandaloneLesson: (input: CreateLessonInput) => Promise<InstructorLesson | null>;
  updateStandaloneLesson: (id: string, input: UpdateLessonInput) => Promise<InstructorLesson | null>;
  deleteStandaloneLesson: (id: string) => Promise<boolean>;
  addItemsToLesson: (lessonId: string, itemIds: string[]) => Promise<InstructorLesson | null>;
  removeItemFromLesson: (lessonId: string, itemId: string) => Promise<InstructorLesson | null>;
  reorderStandaloneLessonItems: (lessonId: string, itemIds: string[]) => Promise<InstructorLesson | null>;
  
  // UI actions
  setCurrentCourse: (course: InstructorCourse | null) => void;
  setCurrentLesson: (lesson: InstructorLesson | null) => void;
  setUnsavedChanges: (value: boolean) => void;
  clearError: () => void;
}

const InstructorContext = createContext<InstructorContextValue | null>(null);

// ============================================
// Provider
// ============================================

export function InstructorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(instructorReducer, initialState);

  // Load instructor profile
  const loadInstructor = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const profile = await instructorProfileService.getCurrentProfile();
      // Convert InstructorProfileResponse to Instructor type for compatibility
      const instructor: Instructor = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        avatar: undefined, // Not available in profile response
        bio: profile.bio,
        expertise: profile.expertises,
        createdAt: profile.createdAt,
      };
      dispatch({ type: 'SET_INSTRUCTOR', payload: instructor });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load instructor profile' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load courses
  const loadCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rawCourses = await courseService.getMyCourses();
      const courses: InstructorCourse[] = await Promise.all(
        rawCourses.map(async (course) => {
          const rawLessons = await lessonService.getLessonsByCourse(course.id);
          const lessons: InstructorLesson[] = await Promise.all(
            rawLessons.map(async (lesson) => {
              const rawItems = await lessonItemService.getItemsByLesson(lesson.id);
              const items = rawItems.map(mapLessonItemToInstructor);
              return mapLessonToInstructor(lesson, items);
            })
          );
          return mapCourseToInstructor(course, lessons);
        })
      );
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load courses' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const rawCategories = await categoryService.getCategories();
      const categories: Category[] = rawCategories.map(c => ({
        id: c.id,
        name: c.name,
        description: '',
      }));
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const rawCourses = await courseService.getMyCourses();
      const stats: DashboardStats = {
        totalCourses: rawCourses.length,
        publishedCourses: 0, // TODO: Add status support
        draftCourses: rawCourses.length,
        totalStudents: rawCourses.reduce((sum, c) => sum + (c.totalEnrolled || 0), 0),
        totalReviews: rawCourses.reduce((sum, c) => sum + (c.reviewCount || 0), 0),
        averageRating: rawCourses.length > 0 
          ? rawCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / rawCourses.length 
          : 0,
        recentActivity: [],
        popularCourses: rawCourses.slice(0, 5).map(c => ({
          courseId: c.id,
          courseName: c.title,
          enrollments: c.totalEnrolled || 0,
        })),
      };
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  // Load single course
  const loadCourse = useCallback(async (courseId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rawCourse = await courseService.getCourseById(courseId);
      const rawLessons = await lessonService.getLessonsByCourse(courseId);
      const lessons: InstructorLesson[] = await Promise.all(
        rawLessons.map(async (lesson) => {
          const rawItems = await lessonItemService.getItemsByLesson(lesson.id);
          const items = rawItems.map(mapLessonItemToInstructor);
          return mapLessonToInstructor(lesson, items);
        })
      );
      const course = mapCourseToInstructor(rawCourse, lessons);
      dispatch({ type: 'SET_CURRENT_COURSE', payload: course });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load course' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Create course
  const createCourse = useCallback(async (input: CreateCourseInput): Promise<InstructorCourse | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rawCourse = await courseService.createCourse({
        name: input.title,
        description: input.description,
        photo: input.thumbnail || '',
        categoryId: input.categoryId,
        tags: [],
      });
      const course = mapCourseToInstructor(rawCourse, []);
      dispatch({ type: 'ADD_COURSE', payload: course });
      return course;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create course' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update course
  const updateCourse = useCallback(async (id: string, input: UpdateCourseInput): Promise<InstructorCourse | null> => {
    try {
      const rawCourse = await courseService.updateCourse(id, {
        name: input.title,
        description: input.description,
        photo: input.thumbnail,
      });
      const rawLessons = await lessonService.getLessonsByCourse(id);
      const lessons: InstructorLesson[] = await Promise.all(
        rawLessons.map(async (lesson) => {
          const rawItems = await lessonItemService.getItemsByLesson(lesson.id);
          const items = rawItems.map(mapLessonItemToInstructor);
          return mapLessonToInstructor(lesson, items);
        })
      );
      const course = mapCourseToInstructor(rawCourse, lessons);
      dispatch({ type: 'UPDATE_COURSE', payload: course });
      return course;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update course' });
      return null;
    }
  }, []);

  // Delete course
  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await courseService.deleteCourse(id);
      if (success) {
        dispatch({ type: 'DELETE_COURSE', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete course' });
      return false;
    }
  }, []);

  // Publish course (TODO: Implement when backend supports status)
  const publishCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Backend doesn't support status yet, just return success
      console.warn('publishCourse: Backend does not support course status yet');
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to publish course' });
      return false;
    }
  }, []);

  // Archive course (TODO: Implement when backend supports status)
  const archiveCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Backend doesn't support status yet, just return success
      console.warn('archiveCourse: Backend does not support course status yet');
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to archive course' });
      return false;
    }
  }, []);

  // Unpublish course (return to draft) (TODO: Implement when backend supports status)
  const unpublishCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Backend doesn't support status yet, just return success
      console.warn('unpublishCourse: Backend does not support course status yet');
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to unpublish course' });
      return false;
    }
  }, []);

  // Create lesson
  const createLesson = useCallback(async (input: CreateLessonInput): Promise<InstructorLesson | null> => {
    try {
      const rawLesson = await lessonService.createLesson({
        title: input.title,
        url: input.title.toLowerCase().replace(/\s+/g, '-'),
        courseId: input.courseId || '',
      });
      const lesson = mapLessonToInstructor(rawLesson, []);
      if (input.courseId) {
        dispatch({ type: 'ADD_LESSON', payload: { courseId: input.courseId, lesson } });
      }
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson' });
      return null;
    }
  }, []);

  // Update lesson
  const updateLesson = useCallback(async (
    courseId: string,
    lessonId: string,
    input: UpdateLessonInput
  ): Promise<InstructorLesson | null> => {
    try {
      const rawLesson = await lessonService.updateLesson(lessonId, {
        title: input.title,
      });
      const rawItems = await lessonItemService.getItemsByLesson(lessonId);
      const items = rawItems.map(mapLessonItemToInstructor);
      const lesson = mapLessonToInstructor(rawLesson, items);
      dispatch({ type: 'UPDATE_LESSON', payload: { courseId, lesson } });
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson' });
      return null;
    }
  }, []);

  // Delete lesson
  const deleteLesson = useCallback(async (courseId: string, lessonId: string): Promise<boolean> => {
    try {
      const success = await lessonService.deleteLesson(lessonId);
      if (success) {
        dispatch({ type: 'DELETE_LESSON', payload: { courseId, lessonId } });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson' });
      return false;
    }
  }, []);

  // Reorder lessons (TODO: Implement when backend supports reordering)
  const reorderLessons = useCallback(async (courseId: string, lessonIds: string[]): Promise<void> => {
    try {
      // Backend doesn't support reordering yet
      console.warn('reorderLessons: Backend does not support lesson reordering yet');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder lessons' });
    }
  }, []);

  // Add existing lessons to course (TODO: Implement when backend supports this)
  const addLessonsToCourse = useCallback(async (
    courseId: string,
    lessonIds: string[]
  ): Promise<InstructorCourse | null> => {
    try {
      // Backend doesn't support this operation yet
      console.warn('addLessonsToCourse: Backend does not support this operation yet');
      return null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add lessons to course' });
      return null;
    }
  }, []);

  // Remove lesson from course (TODO: Implement when backend supports this)
  const removeLessonFromCourse = useCallback(async (
    courseId: string,
    lessonId: string
  ): Promise<InstructorCourse | null> => {
    try {
      // Backend doesn't support this operation yet - just delete the lesson
      await lessonService.deleteLesson(lessonId);
      return null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove lesson from course' });
      return null;
    }
  }, []);

  // Create lesson item
  const createLessonItem = useCallback(async (
    courseId: string,
    lessonId: string,
    input: CreateLessonItemInput
  ): Promise<InstructorLessonItem | null> => {
    try {
      const rawItem = await lessonItemService.createLessonItem({
        name: input.title,
        content: input.content || '',
        type: mapLessonItemTypeToBackend(input.type),
        lessonId: lessonId,
        durationInSeconds: input.durationInSeconds || 0,
      });
      const item = mapLessonItemToInstructor(rawItem);
      dispatch({ type: 'ADD_LESSON_ITEM', payload: { courseId, lessonId, item } });
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson item' });
      return null;
    }
  }, []);

  // Update lesson item
  const updateLessonItem = useCallback(async (
    courseId: string,
    lessonId: string,
    itemId: string,
    input: UpdateLessonItemInput
  ): Promise<InstructorLessonItem | null> => {
    try {
      const rawItem = await lessonItemService.updateLessonItem(itemId, {
        name: input.title,
        durationInSeconds: input.durationInSeconds || 0,
      });
      const item = mapLessonItemToInstructor(rawItem);
      dispatch({ type: 'UPDATE_LESSON_ITEM', payload: { courseId, lessonId, item } });
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson item' });
      return null;
    }
  }, []);

  // Delete lesson item
  const deleteLessonItem = useCallback(async (
    courseId: string,
    lessonId: string,
    itemId: string
  ): Promise<boolean> => {
    try {
      const success = await lessonItemService.deleteLessonItem(itemId);
      if (success) {
        dispatch({ type: 'DELETE_LESSON_ITEM', payload: { courseId, lessonId, itemId } });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson item' });
      return false;
    }
  }, []);

  // Reorder lesson items (TODO: Implement when backend supports reordering)
  const reorderLessonItems = useCallback(async (
    courseId: string,
    lessonId: string,
    itemIds: string[]
  ): Promise<void> => {
    try {
      // Backend doesn't support reordering yet
      console.warn('reorderLessonItems: Backend does not support item reordering yet');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder lesson items' });
    }
  }, []);

  // ============================================
  // Standalone Videos (stored as LessonItems with type=video)
  // ============================================

  const loadVideos = useCallback(async () => {
    try {
      // Videos are stored as lesson items - this is a placeholder
      // In the real implementation, you would fetch lesson items with type=video
      dispatch({ type: 'SET_VIDEOS', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load videos' });
    }
  }, []);

  const createVideo = useCallback(async (input: CreateVideoInput): Promise<VideoContent | null> => {
    try {
      // Create video content locally - will be linked to lesson item
      const video: VideoContent = {
        id: `video-${Date.now()}`,
        title: input.title,
        description: input.description,
        videoUrl: input.videoUrl,
        duration: input.duration,
        thumbnailUrl: input.thumbnailUrl,
        instructorId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_VIDEO', payload: video });
      return video;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create video' });
      return null;
    }
  }, []);

  const updateVideo = useCallback(async (id: string, input: UpdateVideoInput): Promise<VideoContent | null> => {
    try {
      // Update video content locally
      const existingVideo = state.videos.find(v => v.id === id);
      if (!existingVideo) return null;
      const video: VideoContent = {
        ...existingVideo,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_VIDEO', payload: video });
      return video;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update video' });
      return null;
    }
  }, [state.videos]);

  const deleteVideo = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'DELETE_VIDEO', payload: id });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete video' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Rich Contents (stored as LessonItems with type=rich-content)
  // ============================================

  const loadRichContents = useCallback(async () => {
    try {
      // Rich contents are stored as lesson items - this is a placeholder
      dispatch({ type: 'SET_RICH_CONTENTS', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load rich contents' });
    }
  }, []);

  const createRichContent = useCallback(async (input: CreateRichContentInput): Promise<RichContent | null> => {
    try {
      // Create rich content locally - will be linked to lesson item
      const content: RichContent = {
        id: `rich-${Date.now()}`,
        title: input.title,
        description: input.description,
        htmlContent: input.htmlContent,
        instructorId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_RICH_CONTENT', payload: content });
      return content;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create rich content' });
      return null;
    }
  }, []);

  const updateRichContent = useCallback(async (id: string, input: UpdateRichContentInput): Promise<RichContent | null> => {
    try {
      const existingContent = state.richContents.find(r => r.id === id);
      if (!existingContent) return null;
      const content: RichContent = {
        ...existingContent,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_RICH_CONTENT', payload: content });
      return content;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update rich content' });
      return null;
    }
  }, [state.richContents]);

  const deleteRichContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'DELETE_RICH_CONTENT', payload: id });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete rich content' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Questions (stored as LessonItems with type=question)
  // ============================================

  const loadQuestions = useCallback(async () => {
    try {
      // Questions are stored as lesson items - this is a placeholder
      dispatch({ type: 'SET_QUESTIONS', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load questions' });
    }
  }, []);

  const createQuestion = useCallback(async (input: CreateQuestionInput): Promise<QuestionWithAnswers | null> => {
    try {
      // Create question locally - will be linked to lesson item
      const question: QuestionWithAnswers = {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_QUESTION', payload: question });
      return question;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create question' });
      return null;
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null> => {
    try {
      const existingQuestion = state.questions.find(q => q.id === id);
      if (!existingQuestion) return null;
      const question: QuestionWithAnswers = {
        ...existingQuestion,
        text: input.text || existingQuestion.text,
        description: input.description || existingQuestion.description,
        type: input.type || existingQuestion.type,
        answers: input.answers || existingQuestion.answers,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_QUESTION', payload: question });
      return question;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update question' });
      return null;
    }
  }, [state.questions]);

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'DELETE_QUESTION', payload: id });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete question' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Lesson Items
  // ============================================

  const loadLessonItems = useCallback(async () => {
    try {
      // Standalone lesson items are not directly supported - this is a placeholder
      dispatch({ type: 'SET_LESSON_ITEMS', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load lesson items' });
    }
  }, []);

  const createStandaloneLessonItem = useCallback(async (input: CreateLessonItemInput): Promise<InstructorLessonItem | null> => {
    try {
      if (!input.lessonId) {
        dispatch({ type: 'SET_ERROR', payload: 'Lesson ID is required to create a lesson item' });
        return null;
      }
      const rawItem = await lessonItemService.createLessonItem({
        name: input.title,
        content: input.content || '',
        type: mapLessonItemTypeToBackend(input.type),
        lessonId: input.lessonId,
        durationInSeconds: input.durationInSeconds || 0,
      });
      const item = mapLessonItemToInstructor(rawItem);
      dispatch({ type: 'ADD_STANDALONE_LESSON_ITEM', payload: item });
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson item' });
      return null;
    }
  }, []);

  const updateStandaloneLessonItem = useCallback(async (id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null> => {
    try {
      const rawItem = await lessonItemService.updateLessonItem(id, {
        name: input.title,
        durationInSeconds: input.durationInSeconds || 0,
      });
      const item = mapLessonItemToInstructor(rawItem);
      dispatch({ type: 'UPDATE_STANDALONE_LESSON_ITEM', payload: item });
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson item' });
      return null;
    }
  }, []);

  const deleteStandaloneLessonItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await lessonItemService.deleteLessonItem(id);
      if (success) {
        dispatch({ type: 'DELETE_STANDALONE_LESSON_ITEM', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson item' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Lessons
  // ============================================

  const loadLessons = useCallback(async () => {
    try {
      // Standalone lessons are not directly supported - this is a placeholder
      dispatch({ type: 'SET_LESSONS', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load lessons' });
    }
  }, []);

  const createStandaloneLesson = useCallback(async (input: CreateLessonInput): Promise<InstructorLesson | null> => {
    try {
      if (!input.courseId) {
        dispatch({ type: 'SET_ERROR', payload: 'Course ID is required to create a lesson' });
        return null;
      }
      const rawLesson = await lessonService.createLesson({
        title: input.title,
        url: input.title.toLowerCase().replace(/\s+/g, '-'),
        courseId: input.courseId,
      });
      const lesson = mapLessonToInstructor(rawLesson, []);
      dispatch({ type: 'ADD_STANDALONE_LESSON', payload: lesson });
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson' });
      return null;
    }
  }, []);

  const updateStandaloneLesson = useCallback(async (id: string, input: UpdateLessonInput): Promise<InstructorLesson | null> => {
    try {
      const rawLesson = await lessonService.updateLesson(id, {
        title: input.title,
      });
      const rawItems = await lessonItemService.getItemsByLesson(id);
      const items = rawItems.map(mapLessonItemToInstructor);
      const lesson = mapLessonToInstructor(rawLesson, items);
      dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson' });
      return null;
    }
  }, []);

  const deleteStandaloneLesson = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await lessonService.deleteLesson(id);
      if (success) {
        dispatch({ type: 'DELETE_STANDALONE_LESSON', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson' });
      return false;
    }
  }, []);

  const addItemsToLesson = useCallback(async (lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> => {
    try {
      // Backend doesn't support this operation directly - items are added via createLessonItem
      console.warn('addItemsToLesson: Items should be created with createLessonItem');
      return null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add items to lesson' });
      return null;
    }
  }, []);

  const removeItemFromLesson = useCallback(async (lessonId: string, itemId: string): Promise<InstructorLesson | null> => {
    try {
      // Remove item by deleting it
      await lessonItemService.deleteLessonItem(itemId);
      // Return updated lesson
      const rawLesson = await lessonService.getLessonById(lessonId);
      const rawItems = await lessonItemService.getItemsByLesson(lessonId);
      const items = rawItems.map(mapLessonItemToInstructor);
      const lesson = mapLessonToInstructor(rawLesson, items);
      dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from lesson' });
      return null;
    }
  }, []);

  const reorderStandaloneLessonItems = useCallback(async (lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> => {
    try {
      // Backend doesn't support reordering yet
      console.warn('reorderStandaloneLessonItems: Backend does not support item reordering yet');
      return null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder lesson items' });
      return null;
    }
  }, []);

  // UI actions
  const setCurrentCourse = useCallback((course: InstructorCourse | null) => {
    dispatch({ type: 'SET_CURRENT_COURSE', payload: course });
  }, []);

  const setCurrentLesson = useCallback((lesson: InstructorLesson | null) => {
    dispatch({ type: 'SET_CURRENT_LESSON', payload: lesson });
  }, []);

  const setUnsavedChanges = useCallback((value: boolean) => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: value });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Initial load
  useEffect(() => {
    loadInstructor();
    loadCategories();
  }, [loadInstructor, loadCategories]);

  const value: InstructorContextValue = {
    ...state,
    loadInstructor,
    loadCourses,
    loadCategories,
    loadDashboardStats,
    loadCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    archiveCourse,
    unpublishCourse,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    addLessonsToCourse,
    removeLessonFromCourse,
    createLessonItem,
    updateLessonItem,
    deleteLessonItem,
    reorderLessonItems,
    // Standalone content actions
    loadVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    loadRichContents,
    createRichContent,
    updateRichContent,
    deleteRichContent,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    // Standalone lesson items
    loadLessonItems,
    createStandaloneLessonItem,
    updateStandaloneLessonItem,
    deleteStandaloneLessonItem,
    // Standalone lessons
    loadLessons,
    createStandaloneLesson,
    updateStandaloneLesson,
    deleteStandaloneLesson,
    addItemsToLesson,
    removeItemFromLesson,
    reorderStandaloneLessonItems,
    // UI actions
    setCurrentCourse,
    setCurrentLesson,
    setUnsavedChanges,
    clearError,
  };

  return (
    <InstructorContext.Provider value={value}>
      {children}
    </InstructorContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructor must be used within an InstructorProvider');
  }
  return context;
}
