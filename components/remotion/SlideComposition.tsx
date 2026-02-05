import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Audio } from 'remotion';
import React from 'react';
import { Slide } from '@/lib/slidesStore';

export const SlideComposition: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {slides.map((slide, index) => {
        // Default to 5 seconds (150 frames at 30fps) if no audio duration
        // If audio exists, calculate frames: duration * 30
        const durationInFrames = slide.duration ? Math.ceil(slide.duration * 30) : 150;
        const startFrame = accumulatedFrames;
        accumulatedFrames += durationInFrames;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SlideView slide={slide} />
            {slide.audioUrl && <Audio src={slide.audioUrl} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideView: React.FC<{ slide: Slide }> = ({ slide }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const slideUp = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: slide.backgroundColor, color: slide.textColor }}>
      <div className="flex flex-col items-center justify-center h-full p-16 text-center">
        <h1 
          style={{ opacity, transform: `translateY(${slideUp}px)` }}
          className="text-6xl font-bold mb-12"
        >
          {slide.title}
        </h1>
        
        <ul className="space-y-6 text-left">
          {slide.bullets.map((bullet, i) => {
            const bulletOpacity = interpolate(frame, [20 + (i * 10), 40 + (i * 10)], [0, 1]);
            const bulletSlide = interpolate(frame, [20 + (i * 10), 40 + (i * 10)], [20, 0], { extrapolateRight: 'clamp' });
            
            return (
              <li 
                key={i} 
                style={{ opacity: bulletOpacity, transform: `translateX(${bulletSlide}px)` }}
                className="text-3xl font-medium flex items-center gap-4"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slide.textColor }} />
                {bullet}
              </li>
            );
          })}
        </ul>
      </div>
    </AbsoluteFill>
  );
};
