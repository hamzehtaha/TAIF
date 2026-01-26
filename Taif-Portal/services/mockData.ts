import { Course, Lesson } from "./courseService";

export interface Section {
  id: string;
  title: string;
  duration: number;
  lessons: Lesson[];
  order: number;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript. Perfect for beginners starting their web development journey.",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    instructor: {
      id: "i1",
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    duration: 40,
    difficulty: "beginner",
    rating: 4.8,
    reviewCount: 245,
    enrollmentCount: 3420,
    tags: ["Web", "Frontend", "Beginner"],
    lessons: [
      {
        id: "l1",
        title: "What is Web Development?",
        description: "Overview of web development",
        duration: 15,
        order: 1,
      },
      {
        id: "l2",
        title: "HTML Basics",
        description: "Learn HTML fundamentals",
        duration: 20,
        order: 2,
      },
      {
        id: "l3",
        title: "CSS Styling",
        description: "Master CSS styling",
        duration: 25,
        order: 3,
      },
    ],
  },
  {
    id: "2",
    title: "React Fundamentals",
    description:
      "Master React and build modern single-page applications. Learn hooks, state management, and best practices.",
    imageUrl:
      "https://images.unsplash.com/photo-1633356713697-e94924ca95d3?w=500&h=300&fit=crop",
    instructor: {
      id: "i2",
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    duration: 45,
    difficulty: "intermediate",
    rating: 4.9,
    reviewCount: 189,
    enrollmentCount: 2890,
    tags: ["React", "JavaScript", "Frontend"],
    lessons: [
      {
        id: "l4",
        title: "React Introduction",
        description: "Introduction to React",
        duration: 20,
        order: 1,
      },
      {
        id: "l5",
        title: "Components & Props",
        description: "Learn about components",
        duration: 25,
        order: 2,
      },
    ],
  },
  {
    id: "3",
    title: "Advanced JavaScript",
    description:
      "Deep dive into JavaScript. Learn advanced concepts like closures, promises, async/await, and modern ES6+ features.",
    imageUrl:
      "https://images.unsplash.com/photo-1518133910546-26b7e1d1f160?w=500&h=300&fit=crop",
    instructor: {
      id: "i3",
      name: "Mike Davis",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    duration: 50,
    difficulty: "advanced",
    rating: 4.7,
    reviewCount: 156,
    enrollmentCount: 1234,
    tags: ["JavaScript", "Advanced", "Development"],
    lessons: [
      {
        id: "l6",
        title: "Closures & Scope",
        description: "Understanding closures",
        duration: 30,
        order: 1,
      },
    ],
  },
  {
    id: "4",
    title: "Web Design Essentials",
    description:
      "Create beautiful and user-friendly websites. Learn design principles, UX/UI, and responsive design.",
    imageUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop",
    instructor: {
      id: "i4",
      name: "Emma Wilson",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    duration: 35,
    difficulty: "beginner",
    rating: 4.6,
    reviewCount: 234,
    enrollmentCount: 4120,
    tags: ["Design", "UX/UI", "Frontend"],
    lessons: [
      {
        id: "l7",
        title: "Design Principles",
        description: "Learning design",
        duration: 20,
        order: 1,
      },
    ],
  },
  {
    id: "5",
    title: "TypeScript Mastery",
    description:
      "Learn TypeScript and write type-safe JavaScript. Perfect for building scalable applications.",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=500&h=300&fit=crop",
    instructor: {
      id: "i5",
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    duration: 42,
    difficulty: "intermediate",
    rating: 4.8,
    reviewCount: 167,
    enrollmentCount: 2345,
    tags: ["TypeScript", "JavaScript", "Development"],
    lessons: [
      {
        id: "l8",
        title: "TypeScript Setup",
        description: "Setting up TypeScript",
        duration: 15,
        order: 1,
      },
    ],
  },
  {
    id: "6",
    title: "Full Stack Web Development",
    description:
      "Build complete web applications from frontend to backend. Learn Node.js, databases, and deployment.",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop",
    instructor: {
      id: "i6",
      name: "Lisa Anderson",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    duration: 60,
    difficulty: "advanced",
    rating: 4.9,
    reviewCount: 298,
    enrollmentCount: 5234,
    tags: ["Full Stack", "Backend", "Frontend"],
    lessons: [
      {
        id: "l9",
        title: "Introduction",
        description: "Course intro",
        duration: 15,
        order: 1,
      },
    ],
  },
];

// Mock sections for enhanced course structure
export const mockCourseSections: Record<string, Section[]> = {
  "1": [
    {
      id: "s1",
      title: "Getting Started",
      duration: 35,
      order: 1,
      lessons: [
        {
          id: "l1-1",
          title: "What is Web Development?",
          description: "Overview of web development and career paths",
          duration: 15,
          order: 1,
          isCompleted: true,
        },
        {
          id: "l1-2",
          title: "Setting Up Your Environment",
          description: "Install tools and set up your development environment",
          duration: 12,
          order: 2,
          isCompleted: true,
        },
        {
          id: "l1-3",
          title: "Your First Website",
          description: "Create your first simple website",
          duration: 8,
          order: 3,
          isCompleted: false,
        },
      ],
    },
    {
      id: "s2",
      title: "HTML Fundamentals",
      duration: 45,
      order: 2,
      lessons: [
        {
          id: "l1-4",
          title: "HTML Structure",
          description: "Learn the basic structure of HTML documents",
          duration: 15,
          order: 1,
          isCompleted: false,
        },
        {
          id: "l1-5",
          title: "Common HTML Tags",
          description: "Explore commonly used HTML elements",
          duration: 18,
          order: 2,
          isCompleted: false,
        },
        {
          id: "l1-6",
          title: "Forms & Input",
          description: "Create interactive forms with HTML",
          duration: 12,
          order: 3,
          isCompleted: false,
        },
      ],
    },
    {
      id: "s3",
      title: "CSS & Styling",
      duration: 50,
      order: 3,
      lessons: [
        {
          id: "l1-7",
          title: "CSS Basics",
          description: "Get started with CSS styling",
          duration: 20,
          order: 1,
          isCompleted: false,
        },
        {
          id: "l1-8",
          title: "Layouts & Positioning",
          description: "Master CSS layouts and positioning",
          duration: 20,
          order: 2,
          isCompleted: false,
        },
        {
          id: "l1-9",
          title: "Responsive Design",
          description: "Create responsive websites",
          duration: 10,
          order: 3,
          isCompleted: false,
        },
      ],
    },
  ],
  "2": [
    {
      id: "s2-1",
      title: "React Basics",
      duration: 40,
      order: 1,
      lessons: [
        {
          id: "l2-1",
          title: "Introduction to React",
          description: "Learn what React is and why it's useful",
          duration: 15,
          order: 1,
          isCompleted: true,
        },
        {
          id: "l2-2",
          title: "JSX & Components",
          description: "Understand JSX syntax and component creation",
          duration: 15,
          order: 2,
          isCompleted: true,
        },
        {
          id: "l2-3",
          title: "Props & State",
          description: "Master props and state management",
          duration: 10,
          order: 3,
          isCompleted: false,
        },
      ],
    },
    {
      id: "s2-2",
      title: "React Hooks",
      duration: 35,
      order: 2,
      lessons: [
        {
          id: "l2-4",
          title: "useState Hook",
          description: "Learn how to use the useState hook",
          duration: 12,
          order: 1,
          isCompleted: false,
        },
        {
          id: "l2-5",
          title: "useEffect Hook",
          description: "Handle side effects with useEffect",
          duration: 13,
          order: 2,
          isCompleted: false,
        },
        {
          id: "l2-6",
          title: "Custom Hooks",
          description: "Create reusable custom hooks",
          duration: 10,
          order: 3,
          isCompleted: false,
        },
      ],
    },
  ],
};

export function getMockCourses(): Course[] {
  return mockCourses;
}

export function getMockCourseById(id: string): Course | undefined {
  return mockCourses.find((c) => c.id === id);
}
