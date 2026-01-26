/**
 * Data Provider - Handles switching between Mock and Real API
 * Returns DTOs (minimal backend structure) that services will map to UI models
 */

import { API_CONFIG } from '@/config/dataSource';
import localDB from '@/data/localDB.json';

export class DataProvider {
  private static mockData = localDB;

  /**
   * Get data from either mock JSON or real API
   * Returns DTOs (backend structure)
   */
  static async get<T>(endpoint: string, apiFetcher: () => Promise<T>): Promise<T> {
    if (API_CONFIG.useMockData) {
      // Return mock data as DTOs
      return this.getMockData<T>(endpoint);
    } else {
      // Call real API - returns DTOs
      return await apiFetcher();
    }
  }

  /**
   * Post data to either mock (simulated) or real API
   */
  static async post<T>(
    endpoint: string,
    data: any,
    apiFetcher: () => Promise<T>
  ): Promise<T> {
    if (API_CONFIG.useMockData) {
      // Simulate API response
      console.log(`[MOCK] POST ${endpoint}`, data);
      return { success: true } as T;
    } else {
      // Call real API
      return await apiFetcher();
    }
  }

  /**
   * Get mock data based on endpoint pattern
   * Returns DTO structure (id, name only) to match backend
   */
  private static getMockData<T>(endpoint: string): T {
    // Parse endpoint to determine what data to return
    if (endpoint.includes('/courses/enrolled')) {
      const enrolled = this.mockData.courses.filter((c: any) => c.isEnrolled);
      return enrolled.map((c: any) => ({ id: c.id, name: c.title })) as T;
    }
    
    if (endpoint.includes('/courses/') && endpoint.includes('/lessons/') && endpoint.includes('/items')) {
      // Pattern: /courses/{courseId}/lessons/{lessonId}/items
      const parts = endpoint.split('/');
      const lessonId = parts[parts.indexOf('lessons') + 1];
      const items = this.mockData.lessonItems.filter((item: any) => 
        item.lessonId === lessonId
      );
      return items.map((item: any) => ({ 
        id: item.id, 
        name: item.title,
        type: "video" as const
      })) as T;
    }
    
    if (endpoint.includes('/courses/') && endpoint.includes('/lessons')) {
      // Pattern: /courses/{courseId}/lessons
      const courseId = endpoint.split('/')[2];
      const lessons = this.mockData.lessons.filter((lesson: any) => 
        lesson.courseId === courseId
      );
      return lessons.map((l: any) => ({ id: l.id, name: l.title })) as T;
    }
    
    if (endpoint.includes('/courses/')) {
      // Pattern: /courses/{id}
      const courseId = endpoint.split('/')[2];
      const course = this.mockData.courses.find((c: any) => c.id === courseId);
      if (course) {
        return { id: course.id, name: course.title } as T;
      }
      return null as T;
    }
    
    if (endpoint === '/courses') {
      return this.mockData.courses.map((c: any) => ({ 
        id: c.id, 
        name: c.title 
      })) as T;
    }

    // Default: return empty array
    console.warn(`[MOCK] No mock data found for endpoint: ${endpoint}`);
    return [] as T;
  }

  /**
   * Check if using mock data
   */
  static isMockMode(): boolean {
    return API_CONFIG.useMockData;
  }
}
