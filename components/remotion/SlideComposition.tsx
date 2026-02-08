import { AbsoluteFill, Sequence, useCurrentFrame, Audio } from 'remotion';
import React from 'react';
import { EnhancedSlide } from '@/lib/slidesStore';

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
            <SlideView slide={slide} />
            {slide.audioUrl && <Audio src={slide.audioUrl} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideView: React.FC<{ slide: EnhancedSlide }> = ({ slide }) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = Math.min(1, frame / 20);
  const scale = 0.95 + (0.05 * Math.min(1, frame / 25));

  if (slide.htmlContent) {
    return (
      <AbsoluteFill style={{
        opacity,
        transform: `scale(${scale})`,
      }}>
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
        />
      </AbsoluteFill>
    );
  }

  // Fallback for slides without HTML content
  return (
    <AbsoluteFill style={{
      background: slide.gradient || `linear-gradient(135deg, ${slide.backgroundColor} 0%, ${adjustColor(slide.backgroundColor, -30)} 100%)`,
      color: slide.textColor,
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '40%',
        height: '40%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${slide.accentColor || slide.textColor}20 0%, transparent 70%)`,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '80px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 700,
          marginBottom: '40px',
        }}>
          {slide.title}
        </h1>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          textAlign: 'left',
        }}>
          {slide.bullets?.map((bullet, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '24px',
              marginBottom: '16px',
              opacity: Math.min(1, (frame - 15 - i * 8) / 15),
              transform: `translateX(${Math.max(0, 20 - (frame - 15 - i * 8))}px)`,
            }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: slide.accentColor || '#ec4899',
                flexShrink: 0,
              }} />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </AbsoluteFill>
  );
};

function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));

  if (color?.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }
  return color || '#000000';
}
