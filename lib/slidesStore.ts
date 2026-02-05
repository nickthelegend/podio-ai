import { create } from 'zustand'

export interface Slide {
  title: string;
  bullets: string[];
  speakerNotes: string;
  backgroundColor: string;
  textColor: string;
  audioUrl?: string; // We'll attach the TTS URL here later
  duration?: number; // In seconds, calculated from audio
}

interface SlidesState {
  topic: string;
  style: string;
  slideCount: number;
  slides: Slide[];
  isGenerating: boolean;
  
  setTopic: (topic: string) => void;
  setStyle: (style: string) => void;
  setSlideCount: (count: number) => void;
  setSlides: (slides: Slide[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
}

export const useSlidesStore = create<SlidesState>((set) => ({
  topic: '',
  style: 'Modern',
  slideCount: 5,
  slides: [],
  isGenerating: false,

  setTopic: (topic) => set({ topic }),
  setStyle: (style) => set({ style }),
  setSlideCount: (slideCount) => set({ slideCount }),
  setSlides: (slides) => set({ slides }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  updateSlide: (index, updates) => set((state) => {
    const newSlides = [...state.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    return { slides: newSlides };
  }),
}))
