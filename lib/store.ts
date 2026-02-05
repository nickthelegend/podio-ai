import { create } from 'zustand'

interface DialogueLine {
  speaker: string;
  line: string;
}

interface PodcastState {
  topic: string;
  language: string;
  script: DialogueLine[];
  audioUrl: string | null;
  isGeneratingScript: boolean;
  isGeneratingAudio: boolean;
  
  setTopic: (topic: string) => void;
  setLanguage: (language: string) => void;
  setScript: (script: DialogueLine[]) => void;
  setAudioUrl: (url: string) => void;
  setIsGeneratingScript: (isGenerating: boolean) => void;
  setIsGeneratingAudio: (isGenerating: boolean) => void;
}

export const usePodcastStore = create<PodcastState>((set) => ({
  topic: '',
  language: 'en-US',
  script: [],
  audioUrl: null,
  isGeneratingScript: false,
  isGeneratingAudio: false,

  setTopic: (topic) => set({ topic }),
  setLanguage: (language) => set({ language }),
  setScript: (script) => set({ script }),
  setAudioUrl: (audioUrl) => set({ audioUrl }),
  setIsGeneratingScript: (isGeneratingScript) => set({ isGeneratingScript }),
  setIsGeneratingAudio: (isGeneratingAudio) => set({ isGeneratingAudio }),
}))
