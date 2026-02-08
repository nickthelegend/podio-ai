import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateScriptFormat = (script: any) => {
  if (!Array.isArray(script)) return false;
  return script.every(line => 
    typeof line.speaker === 'string' && 
    typeof line.line === 'string'
  );
};

export const calculateSlideDuration = (speakerNotes: string) => {
  const words = speakerNotes.split(/\s+/).length;
  return Math.max(5, words / 2.5); // Min 5 seconds, 2.5 words per second
};
