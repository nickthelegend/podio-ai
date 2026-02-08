import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Slide {
  title: string;
  bullets: string[];
  speakerNotes: string;
  backgroundColor: string;
  textColor: string;
  audioUrl?: string;
  duration?: number;
}

export interface BrandKit {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

export interface EnhancedSlide extends Slide {
  layoutType: 'title' | 'content' | 'quote' | 'statistics' | 'timeline' | 'image' | 'comparison' | 'conclusion';
  gradient?: string;
  accentColor?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  htmlContent?: string;
}

export interface Project {
  id: string;
  topic: string;
  style: string;
  format: '16:9' | '4:5' | '9:16';
  slides: EnhancedSlide[];
  brand?: BrandKit;
  createdAt: string;
  updatedAt: string;
  hasVideo: boolean;
}

interface SlidesState {
  // Current editing state
  projectId: string | null;
  topic: string;
  style: string;
  format: '16:9' | '4:5' | '9:16';
  brand: BrandKit | null;
  slideCount: number;
  slides: EnhancedSlide[];
  isGenerating: boolean;
  hasSubmitted: boolean;
  hasVideo: boolean;

  // Actions
  setProjectId: (id: string | null) => void;
  setTopic: (topic: string) => void;
  setStyle: (style: string) => void;
  setFormat: (format: '16:9' | '4:5' | '9:16') => void;
  setBrand: (brand: BrandKit | null) => void;
  setSlideCount: (count: number) => void;
  setSlides: (slides: EnhancedSlide[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setHasSubmitted: (hasSubmitted: boolean) => void;
  setHasVideo: (hasVideo: boolean) => void;
  updateSlide: (index: number, updates: Partial<EnhancedSlide>) => void;

  // Project management
  loadProject: (project: Project) => void;
  getProject: () => Project | null;
  reset: () => void;
}

// Generate a UUID v4 for project ID
export function generateProjectId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const useSlidesStore = create<SlidesState>()(
  persist(
    (set, get) => ({
      projectId: null,
      topic: '',
      style: 'Modern',
      format: '16:9',
      brand: null,
      slideCount: 5,
      slides: [],
      isGenerating: false,
      hasSubmitted: false,
      hasVideo: false,

      setProjectId: (projectId) => set({ projectId }),
      setTopic: (topic) => set({ topic }),
      setStyle: (style) => set({ style }),
      setFormat: (format) => set({ format }),
      setBrand: (brand) => set({ brand }),
      setSlideCount: (slideCount) => set({ slideCount }),
      setSlides: (slides) => set({ slides }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setHasSubmitted: (hasSubmitted) => set({ hasSubmitted }),
      setHasVideo: (hasVideo) => set({ hasVideo }),
      updateSlide: (index, updates) => set((state) => {
        const newSlides = [...state.slides];
        newSlides[index] = { ...newSlides[index], ...updates };
        return { slides: newSlides };
      }),

      loadProject: (project) => set({
        projectId: project.id,
        topic: project.topic,
        style: project.style,
        format: project.format || '16:9',
        brand: project.brand || null,
        slides: project.slides,
        hasSubmitted: true,
        hasVideo: project.hasVideo,
      }),

      getProject: () => {
        const state = get();
        if (!state.projectId || state.slides.length === 0) return null;

        return {
          id: state.projectId,
          topic: state.topic,
          style: state.style,
          format: state.format,
          slides: state.slides,
          brand: state.brand,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasVideo: state.hasVideo,
        } as any;
      },

      reset: () => set({
        projectId: null,
        topic: '',
        slides: [],
        isGenerating: false,
        hasSubmitted: false,
        hasVideo: false,
        brand: null,
        format: '16:9',
      }),
    }),
    {
      name: 'slides-storage',
      partialize: (state) => ({
        projectId: state.projectId,
        topic: state.topic,
        style: state.style,
        slides: state.slides,
        hasVideo: state.hasVideo,
        format: state.format,
        brand: state.brand,
      }),
    }
  )
)
