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
} from '@/types/instructor';
import { 
  dataService,
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
} from '@/services/instructor/dataService';
import { instructorProfileService, InstructorProfileResponse } from '@/services/instructor-profile.service';

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
      const courses = await dataService.getCourses();
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
      const categories = await dataService.getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await dataService.getDashboardStats();
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }, []);

  // Load single course
  const loadCourse = useCallback(async (courseId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const course = await dataService.getCourseById(courseId);
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
      const course = await dataService.createCourse(input);
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
      const course = await dataService.updateCourse(id, input);
      if (course) {
        dispatch({ type: 'UPDATE_COURSE', payload: course });
      }
      return course;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update course' });
      return null;
    }
  }, []);

  // Delete course
  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteCourse(id);
      if (success) {
        dispatch({ type: 'DELETE_COURSE', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete course' });
      return false;
    }
  }, []);

  // Publish course
  const publishCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const course = await dataService.publishCourse(id);
      if (course) {
        dispatch({ type: 'UPDATE_COURSE', payload: course });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to publish course' });
      return false;
    }
  }, []);

  // Archive course
  const archiveCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const course = await dataService.archiveCourse(id);
      if (course) {
        dispatch({ type: 'UPDATE_COURSE', payload: course });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to archive course' });
      return false;
    }
  }, []);

  // Unpublish course (return to draft)
  const unpublishCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const course = await dataService.unpublishCourse(id);
      if (course) {
        dispatch({ type: 'UPDATE_COURSE', payload: course });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to unpublish course' });
      return false;
    }
  }, []);

  // Create lesson
  const createLesson = useCallback(async (input: CreateLessonInput): Promise<InstructorLesson | null> => {
    try {
      const lesson = await dataService.createLesson(input);
      if (lesson) {
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
      const lesson = await dataService.updateLesson(lessonId, input);
      if (lesson) {
        dispatch({ type: 'UPDATE_LESSON', payload: { courseId, lesson } });
      }
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson' });
      return null;
    }
  }, []);

  // Delete lesson
  const deleteLesson = useCallback(async (courseId: string, lessonId: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteLesson(lessonId);
      if (success) {
        dispatch({ type: 'DELETE_LESSON', payload: { courseId, lessonId } });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson' });
      return false;
    }
  }, []);

  // Reorder lessons
  const reorderLessons = useCallback(async (courseId: string, lessonIds: string[]): Promise<void> => {
    try {
      const result = await dataService.reorderCourseLessons(courseId, lessonIds);
      const lessons = result?.lessons || [];
      dispatch({ type: 'REORDER_LESSONS', payload: { courseId, lessons } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder lessons' });
    }
  }, []);

  // Add existing lessons to course
  const addLessonsToCourse = useCallback(async (
    courseId: string,
    lessonIds: string[]
  ): Promise<InstructorCourse | null> => {
    try {
      const course = await dataService.addLessonsToCourse(courseId, lessonIds);
      if (course) {
        dispatch({ type: 'SET_CURRENT_COURSE', payload: course });
      }
      return course;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add lessons to course' });
      return null;
    }
  }, []);

  // Remove lesson from course
  const removeLessonFromCourse = useCallback(async (
    courseId: string,
    lessonId: string
  ): Promise<InstructorCourse | null> => {
    try {
      const course = await dataService.removeLessonFromCourse(courseId, lessonId);
      if (course) {
        dispatch({ type: 'SET_CURRENT_COURSE', payload: course });
      }
      return course;
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
      const item = await dataService.createLessonItem({ ...input, lessonId });
      if (item) {
        dispatch({ type: 'ADD_LESSON_ITEM', payload: { courseId, lessonId, item } });
      }
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
      const item = await dataService.updateLessonItem(itemId, input);
      if (item) {
        dispatch({ type: 'UPDATE_LESSON_ITEM', payload: { courseId, lessonId, item } });
      }
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
      const success = await dataService.deleteLessonItem(itemId);
      if (success) {
        dispatch({ type: 'DELETE_LESSON_ITEM', payload: { courseId, lessonId, itemId } });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete lesson item' });
      return false;
    }
  }, []);

  // Reorder lesson items
  const reorderLessonItems = useCallback(async (
    courseId: string,
    lessonId: string,
    itemIds: string[]
  ): Promise<void> => {
    try {
      const result = await dataService.reorderLessonItems(lessonId, itemIds);
      const items = result?.items || [];
      dispatch({ type: 'REORDER_LESSON_ITEMS', payload: { courseId, lessonId, items } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder lesson items' });
    }
  }, []);

  // ============================================
  // Standalone Videos
  // ============================================

  const loadVideos = useCallback(async () => {
    try {
      const videos = await dataService.getVideos();
      dispatch({ type: 'SET_VIDEOS', payload: videos });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load videos' });
    }
  }, []);

  const createVideo = useCallback(async (input: CreateVideoInput): Promise<VideoContent | null> => {
    try {
      const video = await dataService.createVideo(input);
      dispatch({ type: 'ADD_VIDEO', payload: video });
      return video;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create video' });
      return null;
    }
  }, []);

  const updateVideo = useCallback(async (id: string, input: UpdateVideoInput): Promise<VideoContent | null> => {
    try {
      const video = await dataService.updateVideo(id, input);
      if (video) {
        dispatch({ type: 'UPDATE_VIDEO', payload: video });
      }
      return video;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update video' });
      return null;
    }
  }, []);

  const deleteVideo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteVideo(id);
      if (success) {
        dispatch({ type: 'DELETE_VIDEO', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete video' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Rich Contents
  // ============================================

  const loadRichContents = useCallback(async () => {
    try {
      const contents = await dataService.getRichContents();
      dispatch({ type: 'SET_RICH_CONTENTS', payload: contents });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load rich contents' });
    }
  }, []);

  const createRichContent = useCallback(async (input: CreateRichContentInput): Promise<RichContent | null> => {
    try {
      const content = await dataService.createRichContent(input);
      dispatch({ type: 'ADD_RICH_CONTENT', payload: content });
      return content;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create rich content' });
      return null;
    }
  }, []);

  const updateRichContent = useCallback(async (id: string, input: UpdateRichContentInput): Promise<RichContent | null> => {
    try {
      const content = await dataService.updateRichContent(id, input);
      if (content) {
        dispatch({ type: 'UPDATE_RICH_CONTENT', payload: content });
      }
      return content;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update rich content' });
      return null;
    }
  }, []);

  const deleteRichContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteRichContent(id);
      if (success) {
        dispatch({ type: 'DELETE_RICH_CONTENT', payload: id });
      }
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete rich content' });
      return false;
    }
  }, []);

  // ============================================
  // Standalone Questions
  // ============================================

  const loadQuestions = useCallback(async () => {
    try {
      const questions = await dataService.getQuestions();
      dispatch({ type: 'SET_QUESTIONS', payload: questions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load questions' });
    }
  }, []);

  const createQuestion = useCallback(async (input: CreateQuestionInput): Promise<QuestionWithAnswers | null> => {
    try {
      const question = await dataService.createQuestion(input);
      dispatch({ type: 'ADD_QUESTION', payload: question });
      return question;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create question' });
      return null;
    }
  }, []);

  const updateQuestion = useCallback(async (id: string, input: UpdateQuestionInput): Promise<QuestionWithAnswers | null> => {
    try {
      const question = await dataService.updateQuestion(id, input);
      if (question) {
        dispatch({ type: 'UPDATE_QUESTION', payload: question });
      }
      return question;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update question' });
      return null;
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteQuestion(id);
      if (success) {
        dispatch({ type: 'DELETE_QUESTION', payload: id });
      }
      return success;
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
      const items = await dataService.getLessonItems();
      dispatch({ type: 'SET_LESSON_ITEMS', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load lesson items' });
    }
  }, []);

  const createStandaloneLessonItem = useCallback(async (input: CreateLessonItemInput): Promise<InstructorLessonItem | null> => {
    try {
      const item = await dataService.createLessonItem(input);
      dispatch({ type: 'ADD_STANDALONE_LESSON_ITEM', payload: item });
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson item' });
      return null;
    }
  }, []);

  const updateStandaloneLessonItem = useCallback(async (id: string, input: UpdateLessonItemInput): Promise<InstructorLessonItem | null> => {
    try {
      const item = await dataService.updateLessonItem(id, input);
      if (item) {
        dispatch({ type: 'UPDATE_STANDALONE_LESSON_ITEM', payload: item });
      }
      return item;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson item' });
      return null;
    }
  }, []);

  const deleteStandaloneLessonItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteLessonItem(id);
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
      const lessons = await dataService.getLessons();
      dispatch({ type: 'SET_LESSONS', payload: lessons });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load lessons' });
    }
  }, []);

  const createStandaloneLesson = useCallback(async (input: CreateLessonInput): Promise<InstructorLesson | null> => {
    try {
      const lesson = await dataService.createLesson(input);
      dispatch({ type: 'ADD_STANDALONE_LESSON', payload: lesson });
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create lesson' });
      return null;
    }
  }, []);

  const updateStandaloneLesson = useCallback(async (id: string, input: UpdateLessonInput): Promise<InstructorLesson | null> => {
    try {
      const lesson = await dataService.updateLesson(id, input);
      if (lesson) {
        dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      }
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update lesson' });
      return null;
    }
  }, []);

  const deleteStandaloneLesson = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await dataService.deleteLesson(id);
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
      const lesson = await dataService.addItemsToLesson(lessonId, itemIds);
      if (lesson) {
        dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      }
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add items to lesson' });
      return null;
    }
  }, []);

  const removeItemFromLesson = useCallback(async (lessonId: string, itemId: string): Promise<InstructorLesson | null> => {
    try {
      const lesson = await dataService.removeItemFromLesson(lessonId, itemId);
      if (lesson) {
        dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      }
      return lesson;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from lesson' });
      return null;
    }
  }, []);

  const reorderStandaloneLessonItems = useCallback(async (lessonId: string, itemIds: string[]): Promise<InstructorLesson | null> => {
    try {
      const lesson = await dataService.reorderLessonItems(lessonId, itemIds);
      if (lesson) {
        dispatch({ type: 'UPDATE_STANDALONE_LESSON', payload: lesson });
      }
      return lesson;
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
