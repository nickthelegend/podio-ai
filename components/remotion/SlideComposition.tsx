import { AbsoluteFill, Sequence, useCurrentFrame, Audio } from 'remotion';
import React from 'react';
import { EnhancedSlide } from '@/lib/slidesStore';
import SlideContent from '@/components/slides/SlideContent';

export const SlideComposition: React.FC<{ slides: EnhancedSlide[] }> = ({ slides }) => {
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {slides.map((slide, index) => {
        const durationInFrames = slide.duration ? Math.ceil(slide.duration * 30) : 150;
        const startFrame = accumulatedFrames;
        accumulatedFrames += durationInFrames;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SlideView slide={slide} durationInFrames={durationInFrames} />
            {slide.audioUrl && (
              <Sequence from={15}> {/* Start audio after fade-in */}
                <Audio src={slide.audioUrl} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideView: React.FC<{ slide: EnhancedSlide; durationInFrames: number }> = ({ slide, durationInFrames }) => {
  const frame = useCurrentFrame();

  // Fade in animation (first 20 frames)
  const fadeIn = Math.min(1, frame / 20);

  // Fade out animation (last 15 frames)
  const fadeOut = Math.max(0, 1 - Math.max(0, frame - (durationInFrames - 15)) / 15);

  // Combined opacity
  const opacity = fadeIn * fadeOut;

  // Gentle zoom effect throughout the slide duration
  const scale = 1 + (0.05 * (frame / durationInFrames));

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <SlideContent slide={slide} frame={frame} />
    </AbsoluteFill>
  );
};
