"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  FileText,
  Video,
  HelpCircle,
  FileEdit,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Save,
  ArrowLeft,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Users,
  Clock,
  Eye,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { categoryService } from "@/services/category.service";
import { courseService } from "@/services/course.service";
import { lessonService } from "@/services/lesson.service";
import { lessonItemService } from "@/services/lesson-item.service";
import { Lesson } from "@/models/lesson.model";
import { LessonItem } from "@/models/lesson-item.model";
import { instructorService, Instructor } from "@/services/instructor.service";
import { contentService, LessonItemType, Content } from "@/services/content.service";
import { tagService, Tag } from "@/services/tag.service";
import { fileUploadService } from "@/services/file-upload.service";
import { Category } from "@/models/category.model";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  CreateVideoDialog,
  CreateQuizDialog,
  CreateRichTextDialog,
  type VideoContentData,
  type QuizContentData,
  type RichTextContentData,
} from "@/components/admin/content";

// Types for Course Builder
interface BuilderLessonItem {
  id: string;
  tempId: string;
  name: string;
  description: string;
  type: "video" | "quiz" | "rich-content";
  contentId?: string;
  contentTitle?: string;
  durationInSeconds: number;
  order: number;
  // Local content data (for new content not yet saved to backend)
  videoPlaybackId?: string;
  videoAssetId?: string;
  videoThumbnailUrl?: string;
  quizQuestions?: Array<{ questionText: string; options: string[]; correctAnswerIndex: number }>;
  richTextHtml?: string;
}

interface BuilderLesson {
  id: string;
  tempId: string;
  title: string;
  description: string;
  photo: string;
  instructorId?: string;
  instructorName?: string;
  items: BuilderLessonItem[];
  isExpanded: boolean;
  order: number;
}

interface BuilderCourse {
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  tags: string[];
  lessons: BuilderLesson[];
}

const STEPS = [
  { id: 1, title: "Course Info", icon: BookOpen, description: "Basic course details" },
  { id: 2, title: "Lessons", icon: FileText, description: "Add and organize lessons" },
  { id: 3, title: "Content", icon: Layers, description: "Add content to lessons" },
  { id: 4, title: "Review", icon: Eye, description: "Review and publish" },
];

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video, color: "bg-blue-500" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, color: "bg-purple-500" },
  { value: "rich-content", label: "Rich Content", icon: FileEdit, color: "bg-green-500" },
];

function generateTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function CourseBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Data loading
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [existingContent, setExistingContent] = useState<{
    videos: Content[];
    quizzes: Content[];
    richContent: Content[];
  }>({ videos: [], quizzes: [], richContent: [] });
  const [existingLessons, setExistingLessons] = useState<Lesson[]>([]);
  const [existingLessonItems, setExistingLessonItems] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Course data
  const [course, setCourse] = useState<BuilderCourse>({
    name: "",
    description: "",
    photo: "",
    categoryId: "",
    tags: [],
    lessons: [],
  });
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedLessonForContent, setSelectedLessonForContent] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<"video" | "quiz" | "rich-content">("video");
  // Content creation dialog states
  const [createVideoDialogOpen, setCreateVideoDialogOpen] = useState(false);
  const [createQuizDialogOpen, setCreateQuizDialogOpen] = useState(false);
  const [createRichTextDialogOpen, setCreateRichTextDialogOpen] = useState(false);
  
  // Lesson selection dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");
  const [selectedLessonsToAdd, setSelectedLessonsToAdd] = useState<string[]>([]);
  const [selectedLessonItemsToAdd, setSelectedLessonItemsToAdd] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [cats, insts, tags, allContent, lessons, lessonItems] = await Promise.all([
        categoryService.getCategories(),
        instructorService.getAll(),
        tagService.getAllTags(),
        contentService.getAllContent(),
        lessonService.getAllLessons(),
        lessonItemService.getAllLessonItems(),
      ]);
      setCategories(cats);
      setInstructors(insts);
      setAllTags(tags);
      setExistingLessons(lessons);
      setExistingLessonItems(lessonItems);
      
      // Filter content by type
      const videos = allContent.filter(c => c.type === LessonItemType.Video);
      const quizzes = allContent.filter(c => c.type === LessonItemType.Quiz);
      const richContent = allContent.filter(c => c.type === LessonItemType.RichText);
      setExistingContent({ videos, quizzes, richContent });
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh content list after creating new content
  const refreshContent = async () => {
    try {
      const allContent = await contentService.getAllContent();
      const videos = allContent.filter(c => c.type === LessonItemType.Video);
      const quizzes = allContent.filter(c => c.type === LessonItemType.Quiz);
      const richContent = allContent.filter(c => c.type === LessonItemType.RichText);
      setExistingContent({ videos, quizzes, richContent });
    } catch (error) {
      console.error("Failed to refresh content:", error);
    }
  };
  
  // Helper to parse content data from JSON
  const getContentData = (content: Content) => {
    try {
      return JSON.parse(content.contentJson);
    } catch {
      return {};
    }
  };

  // Tag management - using tag IDs for selection
  const toggleTag = (tagId: string) => {
    setCourse({
      ...course,
      tags: course.tags.includes(tagId)
        ? course.tags.filter(t => t !== tagId)
        : [...course.tags, tagId],
    });
  };

  // Lesson management
  const addLesson = () => {
    const newLesson: BuilderLesson = {
      id: "",
      tempId: generateTempId(),
      title: `Lesson ${course.lessons.length + 1}`,
      description: "",
      photo: "",
      items: [],
      isExpanded: true,
      order: course.lessons.length,
    };
    setCourse({ ...course, lessons: [...course.lessons, newLesson] });
    setLessonDialogOpen(false);
  };

  // Add existing lesson to course
  const addExistingLesson = async (lesson: Lesson) => {
    // Fetch lesson items for this lesson
    let lessonItems: BuilderLessonItem[] = [];
    try {
      const items = await lessonService.getLessonItems(lesson.id);
      lessonItems = items.map((item: any, idx: number) => ({
        id: item.id,
        tempId: generateTempId(),
        name: item.name,
        description: item.description || "",
        type: item.type === 0 ? "video" : item.type === 1 ? "rich-content" : "quiz",
        contentId: item.contentId,
        contentTitle: item.name,
        durationInSeconds: item.durationInSeconds || 0,
        order: idx,
      }));
    } catch (error) {
      console.error("Failed to fetch lesson items:", error);
    }

    const newLesson: BuilderLesson = {
      id: lesson.id,
      tempId: generateTempId(),
      title: lesson.title,
      description: lesson.description || "",
      photo: lesson.photo || "",
      instructorId: lesson.instructorId,
      instructorName: lesson.instructor?.firstName,
      items: lessonItems,
      isExpanded: true,
      order: course.lessons.length,
    };
    setCourse({ ...course, lessons: [...course.lessons, newLesson] });
  };

  // Add multiple existing lessons at once
  const addSelectedLessons = async () => {
    if (selectedLessonsToAdd.length === 0) return;
    
    const lessonsToAdd = existingLessons.filter(l => selectedLessonsToAdd.includes(l.id));
    const newLessons: BuilderLesson[] = [];
    
    for (const lesson of lessonsToAdd) {
      let lessonItems: BuilderLessonItem[] = [];
      try {
        const items = await lessonService.getLessonItems(lesson.id);
        lessonItems = items.map((item: any, idx: number) => ({
          id: item.id,
          tempId: generateTempId(),
          name: item.name,
          description: item.description || "",
          type: item.type === 0 ? "video" : item.type === 1 ? "rich-content" : "quiz",
          contentId: item.contentId,
          contentTitle: item.name,
          durationInSeconds: item.durationInSeconds || 0,
          order: idx,
        }));
      } catch (error) {
        console.error("Failed to fetch lesson items:", error);
      }

      newLessons.push({
        id: lesson.id,
        tempId: generateTempId(),
        title: lesson.title,
        description: lesson.description || "",
        photo: lesson.photo || "",
        instructorId: lesson.instructorId,
        instructorName: lesson.instructor?.firstName,
        items: lessonItems,
        isExpanded: false,
        order: course.lessons.length + newLessons.length,
      });
    }
    
    setCourse({ ...course, lessons: [...course.lessons, ...newLessons] });
    setSelectedLessonsToAdd([]);
    setLessonDialogOpen(false);
    toast({
      title: "Lessons Added",
      description: `${newLessons.length} lesson(s) have been added to the course.`,
    });
  };

  // Toggle lesson selection
  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonsToAdd(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Filter existing lessons based on search and exclude already added
  const filteredExistingLessons = existingLessons.filter(lesson => {
    const alreadyAdded = course.lessons.some(l => l.id === lesson.id);
    const matchesSearch = lessonSearchQuery === "" || 
      lesson.title.toLowerCase().includes(lessonSearchQuery.toLowerCase());
    return !alreadyAdded && matchesSearch;
  });

  const updateLesson = (tempId: string, updates: Partial<BuilderLesson>) => {
    setCourse({
      ...course,
      lessons: course.lessons.map(l => 
        l.tempId === tempId ? { ...l, ...updates } : l
      ),
    });
  };

  const removeLesson = (tempId: string) => {
    setCourse({
      ...course,
      lessons: course.lessons
        .filter(l => l.tempId !== tempId)
        .map((l, idx) => ({ ...l, order: idx })),
    });
  };

  const toggleLessonExpanded = (tempId: string) => {
    updateLesson(tempId, { 
      isExpanded: !course.lessons.find(l => l.tempId === tempId)?.isExpanded 
    });
  };

  // Lesson item management
  const addLessonItem = (lessonTempId: string, contentType: "video" | "quiz" | "rich-content", content?: any) => {
    const lesson = course.lessons.find(l => l.tempId === lessonTempId);
    if (!lesson) return;

    const newItem: BuilderLessonItem = {
      id: "",
      tempId: generateTempId(),
      name: content?.title || content?.name || `New ${contentType}`,
      description: content?.description || "",
      type: contentType,
      contentId: content?.id,
      contentTitle: content?.title || content?.name,
      durationInSeconds: content?.durationInSeconds || 0,
      order: lesson.items.length,
      // Store local content data for new content
      videoPlaybackId: contentType === "video" ? content?.playbackId : undefined,
      videoAssetId: contentType === "video" ? content?.videoAssetId : undefined,
      videoThumbnailUrl: contentType === "video" ? content?.thumbnailUrl : undefined,
      quizQuestions: contentType === "quiz" ? content?.questions : undefined,
      richTextHtml: contentType === "rich-content" ? content?.html : undefined,
    };

    updateLesson(lessonTempId, {
      items: [...lesson.items, newItem],
    });
    setContentDialogOpen(false);
  };

  // Add existing lesson item (reuse, don't create new)
  const addExistingLessonItem = (lessonTempId: string, existingItem: LessonItem) => {
    const lesson = course.lessons.find(l => l.tempId === lessonTempId);
    if (!lesson) return;

    // Check if item already added to this lesson
    if (lesson.items.some(i => i.id === existingItem.id)) {
      toast({
        title: "Already Added",
        description: "This lesson item is already in the lesson.",
        variant: "destructive",
      });
      return;
    }

    // Map from LessonItemType enum to BuilderLessonItem type
    const itemType = existingItem.type === "video" ? "video" : 
                     existingItem.type === "text" ? "rich-content" : "quiz";

    const newItem: BuilderLessonItem = {
      id: existingItem.id, // Set the existing ID - this will trigger reference, not create
      tempId: generateTempId(),
      name: existingItem.name,
      description: existingItem.description || "",
      type: itemType as "video" | "quiz" | "rich-content",
      contentId: existingItem.contentId,
      contentTitle: existingItem.name,
      durationInSeconds: existingItem.durationInSeconds || 0,
      order: lesson.items.length,
    };

    updateLesson(lessonTempId, {
      items: [...lesson.items, newItem],
    });
  };

  // Add multiple existing lesson items at once
  const addSelectedLessonItems = () => {
    if (!selectedLessonForContent || selectedLessonItemsToAdd.length === 0) return;
    
    const lesson = course.lessons.find(l => l.tempId === selectedLessonForContent);
    if (!lesson) return;

    const itemsToAdd = existingLessonItems.filter(i => selectedLessonItemsToAdd.includes(i.id));
    const newItems: BuilderLessonItem[] = [];
    
    for (const existingItem of itemsToAdd) {
      // Skip if already added
      if (lesson.items.some(i => i.id === existingItem.id)) continue;

      const itemType = existingItem.type === "video" ? "video" : 
                       existingItem.type === "text" ? "rich-content" : "quiz";

      newItems.push({
        id: existingItem.id,
        tempId: generateTempId(),
        name: existingItem.name,
        description: existingItem.description || "",
        type: itemType as "video" | "quiz" | "rich-content",
        contentId: existingItem.contentId,
        contentTitle: existingItem.name,
        durationInSeconds: existingItem.durationInSeconds || 0,
        order: lesson.items.length + newItems.length,
      });
    }

    if (newItems.length > 0) {
      updateLesson(selectedLessonForContent, {
        items: [...lesson.items, ...newItems],
      });
      toast({
        title: "Items Added",
        description: `${newItems.length} lesson item(s) have been added.`,
      });
    }
    
    setSelectedLessonItemsToAdd([]);
    setContentDialogOpen(false);
  };

  // Toggle lesson item selection
  const toggleLessonItemSelection = (itemId: string) => {
    setSelectedLessonItemsToAdd(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const updateLessonItem = (lessonTempId: string, itemTempId: string, updates: Partial<BuilderLessonItem>) => {
    const lesson = course.lessons.find(l => l.tempId === lessonTempId);
    if (!lesson) return;

    updateLesson(lessonTempId, {
      items: lesson.items.map(item =>
        item.tempId === itemTempId ? { ...item, ...updates } : item
      ),
    });
  };

  const removeLessonItem = (lessonTempId: string, itemTempId: string) => {
    const lesson = course.lessons.find(l => l.tempId === lessonTempId);
    if (!lesson) return;

    updateLesson(lessonTempId, {
      items: lesson.items
        .filter(item => item.tempId !== itemTempId)
        .map((item, idx) => ({ ...item, order: idx })),
    });
  };

  // Handle video content created locally
  const handleVideoDataReady = (data: VideoContentData) => {
    if (selectedLessonForContent) {
      addLessonItem(selectedLessonForContent, "video", {
        title: data.title,
        description: data.description,
        playbackId: data.playbackId,
        videoAssetId: data.videoAssetId,
        durationInSeconds: data.durationInSeconds,
      });
    }
    setCreateVideoDialogOpen(false);
  };

  // Handle quiz content created locally
  const handleQuizDataReady = (data: QuizContentData) => {
    if (selectedLessonForContent) {
      addLessonItem(selectedLessonForContent, "quiz", {
        title: data.title,
        questions: data.questions,
      });
    }
    setCreateQuizDialogOpen(false);
  };

  // Handle rich text content created locally
  const handleRichTextDataReady = (data: RichTextContentData) => {
    if (selectedLessonForContent) {
      addLessonItem(selectedLessonForContent, "rich-content", {
        title: data.title,
        html: data.html,
      });
    }
    setCreateRichTextDialogOpen(false);
  };

  // Open create dialog based on content type
  const openCreateDialog = () => {
    if (selectedContentType === "video") {
      setCreateVideoDialogOpen(true);
    } else if (selectedContentType === "quiz") {
      setCreateQuizDialogOpen(true);
    } else if (selectedContentType === "rich-content") {
      setCreateRichTextDialogOpen(true);
    }
  };

  // Get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = allTags.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return course.name.trim() && course.categoryId;
      case 2:
        return course.lessons.length > 0;
      case 3:
        return course.lessons.every(l => l.items.length > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate totals
  const getTotalDuration = () => {
    return course.lessons.reduce((total, lesson) => 
      total + lesson.items.reduce((t, item) => t + item.durationInSeconds, 0), 0
    );
  };

  const getTotalItems = () => {
    return course.lessons.reduce((total, lesson) => total + lesson.items.length, 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Submit course using bulk API
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Build the full course request
      const request = {
        name: course.name,
        description: course.description || undefined,
        photo: course.photo || undefined,
        categoryId: course.categoryId,
        tags: course.tags,
        lessons: course.lessons.map((lesson, lessonIndex) => ({
          // If lesson has an ID, it's an existing lesson - send lessonId
          lessonId: lesson.id || undefined,
          // For new lessons, send the title and other details
          title: lesson.id ? undefined : lesson.title,
          description: lesson.id ? undefined : (lesson.description || undefined),
          photo: lesson.id ? undefined : (lesson.photo || undefined),
          instructorId: lesson.id ? undefined : (lesson.instructorId || undefined),
          order: lessonIndex,
          // Don't send items for existing lessons - they already have their items
          items: lesson.id ? [] : lesson.items.map((item, itemIndex) => {
            const typeNumber = item.type === "video" ? 0 : item.type === "rich-content" ? 1 : 2;
            
            // Build inline content if no contentId (new content created locally)
            let inlineContent = undefined;
            if (!item.id && !item.contentId) {
              if (item.type === "video" && item.videoAssetId) {
                inlineContent = {
                  video: {
                    title: item.name,
                    description: item.description || undefined,
                    thumbnailUrl: item.videoThumbnailUrl || undefined,
                    durationInSeconds: item.durationInSeconds,
                    videoAssetId: item.videoAssetId,
                    playbackId: item.videoPlaybackId || undefined,
                    provider: "mux",
                  },
                };
              } else if (item.type === "rich-content" && item.richTextHtml) {
                inlineContent = {
                  richText: {
                    title: item.name,
                    htmlContent: item.richTextHtml,
                  },
                };
              } else if (item.type === "quiz" && item.quizQuestions) {
                inlineContent = {
                  quiz: {
                    title: item.name,
                    questions: item.quizQuestions.map(q => ({
                      questionText: q.questionText,
                      options: q.options,
                      correctAnswerIndex: q.correctAnswerIndex,
                    })),
                  },
                };
              }
            }

            return {
              // If item has an ID, it's an existing lesson item - send lessonItemId
              lessonItemId: item.id || undefined,
              // For new items, send the name and other details
              name: item.id ? undefined : item.name,
              description: item.id ? undefined : (item.description || undefined),
              type: typeNumber,
              order: itemIndex,
              durationInSeconds: item.durationInSeconds,
              contentId: item.id ? undefined : (item.contentId || undefined),
              // Send inline content if no contentId
              content: inlineContent,
            };
          }),
        })),
      };

      const result = await courseService.createFullCourse(request);

      toast({
        title: "Course Created!",
        description: `"${result.courseName}" has been created successfully with ${result.lessonsCreated} lessons and ${result.lessonItemsCreated} lesson items.`,
      });

      router.push(`/admin/courses/${result.courseId}`);
    } catch (error) {
      console.error("Failed to create course:", error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openContentDialog = (lessonTempId: string) => {
    setSelectedLessonForContent(lessonTempId);
    setContentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading Course Builder...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Course Builder</h1>
            </div>
            <p className="text-muted-foreground">
              Create a complete course with lessons and content in one seamless experience
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all",
                      step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                        step.id === currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.id < currentStep
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted text-muted-foreground"
                      )}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-sm font-medium",
                        step.id === currentStep ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4",
                      index < currentStep - 1 ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Course Info */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Introduction to Web Development"
                      value={course.name}
                      onChange={(e) => setCourse({ ...course, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      rows={4}
                      value={course.description}
                      onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={course.categoryId}
                      onValueChange={(value) => setCourse({ ...course, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course Thumbnail</Label>
                    <ImageUpload
                      value={course.photo}
                      onChange={(url) => setCourse({ ...course, photo: url })}
                      folder="courses"
                      placeholder="Click or drag to upload course thumbnail"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <div className="space-y-2">
                        {allTags.length > 0 ? (
                          allTags.map((tag) => (
                            <div
                              key={tag.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                                course.tags.includes(tag.id)
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              )}
                              onClick={() => toggleTag(tag.id)}
                            >
                              <Checkbox
                                checked={course.tags.includes(tag.id)}
                                onCheckedChange={() => toggleTag(tag.id)}
                              />
                              <span className="text-sm">{tag.name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No tags available. Create tags in Settings first.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    {course.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {course.tags.length} tag(s) selected
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Lessons */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Course Lessons
                      </CardTitle>
                      <CardDescription>
                        Add and organize lessons for your course
                      </CardDescription>
                    </div>
                    <Button onClick={() => setLessonDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.lessons.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No lessons yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your course by adding your first lesson
                      </p>
                      <Button onClick={() => setLessonDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.lessons.map((lesson, index) => (
                        <Card key={lesson.tempId} className="border-l-4 border-l-primary">
                          <Collapsible
                            open={lesson.isExpanded}
                            onOpenChange={() => toggleLessonExpanded(lesson.tempId)}
                          >
                            <div className="flex items-center gap-3 p-4">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-auto">
                                  {lesson.isExpanded ? (
                                    <ChevronDown className="h-5 w-5" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <div className="flex-1">
                                <span className="text-sm text-muted-foreground">
                                  Lesson {index + 1}
                                </span>
                                <h4 className="font-medium">{lesson.title}</h4>
                              </div>
                              <Badge variant="outline">
                                {lesson.items.length} items
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLesson(lesson.tempId)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                {/* Show read-only notice for existing lessons */}
                                {lesson.id && (
                                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                      <strong>Existing Lesson:</strong> This lesson is used by other courses. Editing is disabled to prevent affecting them.
                                    </p>
                                  </div>
                                )}
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>Lesson Title</Label>
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLesson(lesson.tempId, { title: e.target.value })
                                      }
                                      disabled={!!lesson.id}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Instructor</Label>
                                    <Select
                                      value={lesson.instructorId || ""}
                                      onValueChange={(value) =>
                                        updateLesson(lesson.tempId, {
                                          instructorId: value,
                                          instructorName: instructors.find(i => i.id === value)?.firstName,
                                        })
                                      }
                                      disabled={!!lesson.id}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select instructor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {instructors.map((inst) => (
                                          <SelectItem key={inst.id} value={inst.id}>
                                            {inst.firstName} {inst.lastName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLesson(lesson.tempId, { description: e.target.value })
                                    }
                                    rows={2}
                                    disabled={!!lesson.id}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Lesson Thumbnail</Label>
                                  <ImageUpload
                                    value={lesson.photo}
                                    onChange={(url) =>
                                      updateLesson(lesson.tempId, { photo: url })
                                    }
                                    folder="lessons"
                                    placeholder="Click or drag to upload lesson thumbnail"
                                    disabled={!!lesson.id}
                                  />
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Lesson Content
                  </CardTitle>
                  <CardDescription>
                    Add videos, quizzes, and rich content to each lesson
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    {course.lessons.map((lesson, lessonIndex) => (
                      <AccordionItem
                        key={lesson.tempId}
                        value={lesson.tempId}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{lessonIndex + 1}</Badge>
                            <span className="font-medium">{lesson.title}</span>
                            <Badge variant="secondary" className="ml-2">
                              {lesson.items.length} items
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-3">
                            {/* Show read-only notice for existing lessons */}
                            {lesson.id && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg mb-3">
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                  <strong>Existing Lesson:</strong> Content cannot be modified to prevent affecting other courses using this lesson.
                                </p>
                              </div>
                            )}
                            {lesson.items.map((item, itemIndex) => (
                              <div
                                key={item.tempId}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                              >
                                <GripVertical className={cn("h-4 w-4 text-muted-foreground", lesson.id ? "opacity-30" : "cursor-grab")} />
                                <div
                                  className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-md",
                                    item.type === "video" ? "bg-blue-500/20 text-blue-500" :
                                    item.type === "quiz" ? "bg-purple-500/20 text-purple-500" :
                                    "bg-green-500/20 text-green-500"
                                  )}
                                >
                                  {item.type === "video" && <Video className="h-4 w-4" />}
                                  {item.type === "quiz" && <HelpCircle className="h-4 w-4" />}
                                  {item.type === "rich-content" && <FileEdit className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {item.type.replace("-", " ")}
                                    {item.durationInSeconds > 0 && ` • ${formatDuration(item.durationInSeconds)}`}
                                  </p>
                                </div>
                                {/* Only show delete button for new lessons */}
                                {!lesson.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLessonItem(lesson.tempId, item.tempId)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {/* Only show Add Content button for new lessons */}
                            {!lesson.id && (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => openContentDialog(lesson.tempId)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Content
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Review Your Course
                  </CardTitle>
                  <CardDescription>
                    Review everything before creating your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Summary */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {course.photo ? (
                        <img
                          src={fileUploadService.getFullUrl(course.photo)}
                          alt={course.name}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">{course.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {course.description || "No description"}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {course.tags.map(tagId => (
                            <Badge key={tagId} variant="secondary">{getTagName(tagId)}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{course.lessons.length}</p>
                      <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Layers className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{getTotalItems()}</p>
                      <p className="text-sm text-muted-foreground">Content Items</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{formatDuration(getTotalDuration())}</p>
                      <p className="text-sm text-muted-foreground">Total Duration</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Lesson breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Course Structure</h4>
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson.tempId} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {lesson.items.length} items
                          </span>
                        </div>
                        {lesson.items.length > 0 && (
                          <div className="mt-2 pl-8 space-y-1">
                            {lesson.items.map((item, i) => (
                              <div key={item.tempId} className="flex items-center gap-2 text-sm text-muted-foreground">
                                {item.type === "video" && <Video className="h-3 w-3" />}
                                {item.type === "quiz" && <HelpCircle className="h-3 w-3" />}
                                {item.type === "rich-content" && <FileEdit className="h-3 w-3" />}
                                <span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <Badge variant="secondary">{course.lessons.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Items</span>
                  <Badge variant="secondary">{getTotalItems()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <Badge variant="secondary">{formatDuration(getTotalDuration())}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{Math.round((currentStep / 4) * 100)}%</span>
                  </div>
                  <Progress value={(currentStep / 4) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  className="w-full"
                  onClick={currentStep === 4 ? handleSubmit : nextStep}
                  disabled={!canProceed() || isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Course
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                {currentStep > 1 && (
                  <Button variant="outline" className="w-full" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {currentStep === 1 && (
                  <>
                    <p>• Choose a clear, descriptive course name</p>
                    <p>• Add relevant tags to help students find your course</p>
                    <p>• A good thumbnail increases engagement</p>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <p>• Organize lessons in a logical order</p>
                    <p>• Each lesson should focus on one topic</p>
                    <p>• Assign instructors to personalize content</p>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <p>• Mix different content types for engagement</p>
                    <p>• Add quizzes to reinforce learning</p>
                    <p>• Videos should be concise and focused</p>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <p>• Review all details before creating</p>
                    <p>• You can edit the course after creation</p>
                    <p>• Consider publishing after final review</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Selection Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>
              Select existing lesson items or create new content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Content Type Tabs */}
            <div className="flex gap-2">
              {CONTENT_TYPES.map((type) => {
                // Count selected items of this type
                const typeMapping = type.value === "video" ? "video" : type.value === "rich-content" ? "text" : "question";
                const selectedCount = selectedLessonItemsToAdd.filter(id => 
                  existingLessonItems.find(item => item.id === id && item.type === typeMapping)
                ).length;
                return (
                  <Button
                    key={type.value}
                    variant={selectedContentType === type.value ? "default" : "outline"}
                    onClick={() => setSelectedContentType(type.value as any)}
                    className="flex-1 relative"
                  >
                    <type.icon className="h-4 w-4 mr-2" />
                    {type.label}
                    {selectedCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {selectedCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Filtered Lesson Items List */}
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-4 space-y-2">
                {(() => {
                  // Filter existing lesson items by selected content type
                  const typeMapping = selectedContentType === "video" ? "video" : selectedContentType === "rich-content" ? "text" : "question";
                  const filteredItems = existingLessonItems.filter(item => item.type === typeMapping);
                  
                  if (filteredItems.length > 0) {
                    return filteredItems.map((item) => {
                      const icon = item.type === "video" ? Video : item.type === "text" ? FileEdit : HelpCircle;
                      const iconColor = item.type === "video" ? "text-blue-500" : item.type === "text" ? "text-green-500" : "text-purple-500";
                      const Icon = icon;
                      const isSelected = selectedLessonItemsToAdd.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer",
                            isSelected && "bg-primary/10 border border-primary"
                          )}
                          onClick={() => toggleLessonItemSelection(item.id)}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleLessonItemSelection(item.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Icon className={cn("h-5 w-5", iconColor)} />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === "video" ? formatDuration(item.durationInSeconds || 0) : 
                               item.type === "text" ? "Rich Content" : "Quiz"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">Existing</Badge>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No existing {selectedContentType.replace("-", " ")} items available</p>
                        <p className="text-sm mt-1">Click &quot;Create New&quot; to add content</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </ScrollArea>

            {/* Selected count */}
            {selectedLessonItemsToAdd.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedLessonItemsToAdd.length} item(s) selected across all types
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create New {selectedContentType === "video" ? "Video" : selectedContentType === "quiz" ? "Quiz" : "Rich Content"}
            </Button>
            <div className="flex gap-2">
              {selectedLessonItemsToAdd.length > 0 && (
                <Button onClick={addSelectedLessonItems}>
                  Add {selectedLessonItemsToAdd.length} Selected
                </Button>
              )}
              <Button variant="outline" onClick={() => { setContentDialogOpen(false); setSelectedLessonItemsToAdd([]); }}>
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Selection Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
            <DialogDescription>
              Select an existing lesson or create a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search existing lessons..."
              value={lessonSearchQuery}
              onChange={(e) => setLessonSearchQuery(e.target.value)}
            />

            {/* Existing Lessons List */}
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-4 space-y-2">
                {filteredExistingLessons.length > 0 ? (
                  filteredExistingLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer",
                        selectedLessonsToAdd.includes(lesson.id) && "bg-primary/10 border border-primary"
                      )}
                      onClick={() => toggleLessonSelection(lesson.id)}
                    >
                      <Checkbox 
                        checked={selectedLessonsToAdd.includes(lesson.id)}
                        onCheckedChange={() => toggleLessonSelection(lesson.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {lesson.photo ? (
                        <img 
                          src={fileUploadService.getFullUrl(lesson.photo)} 
                          alt={lesson.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.instructor ? `${lesson.instructor.firstName} ${lesson.instructor.lastName}` : "No instructor"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No existing lessons available</p>
                    <p className="text-sm mt-1">Click &quot;Create New&quot; to add a lesson</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Selected count */}
            {selectedLessonsToAdd.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedLessonsToAdd.length} lesson(s) selected
              </div>
            )}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button variant="outline" onClick={addLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Lesson
            </Button>
            <div className="flex gap-2">
              {selectedLessonsToAdd.length > 0 && (
                <Button onClick={addSelectedLessons}>
                  Add {selectedLessonsToAdd.length} Selected
                </Button>
              )}
              <Button variant="outline" onClick={() => { setLessonDialogOpen(false); setSelectedLessonsToAdd([]); }}>
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Creation Dialogs - using local mode to save data locally */}
      <CreateVideoDialog
        open={createVideoDialogOpen}
        onOpenChange={setCreateVideoDialogOpen}
        mode="local"
        onDataReady={handleVideoDataReady}
      />
      <CreateQuizDialog
        open={createQuizDialogOpen}
        onOpenChange={setCreateQuizDialogOpen}
        mode="local"
        onDataReady={handleQuizDataReady}
      />
      <CreateRichTextDialog
        open={createRichTextDialogOpen}
        onOpenChange={setCreateRichTextDialogOpen}
        mode="local"
        onDataReady={handleRichTextDataReady}
      />
    </AdminLayout>
  );
}
