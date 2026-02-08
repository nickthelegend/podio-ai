import { AbsoluteFill, Sequence, useCurrentFrame, Audio } from 'remotion';
import React from 'react';
import { EnhancedSlide } from '@/lib/slidesStore';

// Shared slide content component - inline to avoid import issues in Remotion
const SlideContentRemote: React.FC<{ slide: EnhancedSlide; frame: number }> = ({ slide, frame }) => {
  // Animation helpers
  const getOpacity = (delay: number = 0) => Math.min(1, (frame - delay) / 15);
  const getTranslateY = (delay: number = 0) => Math.max(0, 20 - (frame - delay));

  const bgStyle = slide.gradient ||
    `linear-gradient(135deg, ${slide.backgroundColor || '#0a0a0f'} 0%, ${adjustColor(slide.backgroundColor || '#0a0a0f', -30)} 100%)`;

  const textColor = slide.textColor || '#ffffff';
  const accentColor = slide.accentColor || '#ec4899';

  const renderContent = () => {
    if (slide.layoutType === 'title') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: accentColor,
            marginBottom: '24px',
            padding: '10px 28px',
            background: `${accentColor}15`,
            borderRadius: '100px',
            border: `1px solid ${accentColor}30`,
            opacity: getOpacity(0),
          }}>
            ✨ Presentation
          </div>

          <h1 style={{
            fontSize: '72px',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${textColor} 0%, ${accentColor} 50%, ${adjustColor(accentColor, 40)} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: getOpacity(5),
            transform: `translateY(${getTranslateY(5)}px)`,
          }}>
            {slide.title}
          </h1>

          {(slide.subtitle || slide.description || (slide.bullets && slide.bullets[0])) && (
            <p style={{
              fontSize: '24px',
              color: `${textColor}99`,
              maxWidth: '700px',
              lineHeight: 1.5,
              opacity: getOpacity(15),
            }}>
              {slide.subtitle || slide.description || slide.bullets?.[0]}
            </p>
          )}
        </div>
      );
    }

    if (slide.layoutType === 'statistics') {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '40px',
            opacity: getOpacity(0),
          }}>
            {slide.title}
          </h2>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap',
          }}>
            {slide.bullets?.slice(0, 4).map((stat, i) => {
              const colonIndex = stat.indexOf(':');
              let value = stat;
              let label = '';

              if (colonIndex > 0 && colonIndex < 20) {
                value = stat.substring(0, colonIndex).trim();
                label = stat.substring(colonIndex + 1).trim();
              }

              return (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: '35px 45px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  opacity: getOpacity(15 + i * 8),
                  transform: `translateY(${getTranslateY(15 + i * 8)}px)`,
                  minWidth: '180px',
                }}>
                  <div style={{
                    fontSize: '52px',
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${accentColor}, ${adjustColor(accentColor, 40)})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '8px',
                  }}>
                    {value}
                  </div>
                  {label && (
                    <div style={{
                      fontSize: '16px',
                      color: `${textColor}80`,
                      maxWidth: '150px',
                    }}>
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (slide.layoutType === 'conclusion') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 800,
            margin: 0,
            marginBottom: '40px',
            opacity: getOpacity(0),
          }}>
            {slide.title}
          </h1>

          {slide.bullets && slide.bullets.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              maxWidth: '900px',
              opacity: getOpacity(15),
            }}>
              {slide.bullets.map((item, i) => (
                <span key={i} style={{
                  padding: '14px 28px',
                  borderRadius: '100px',
                  fontSize: '18px',
                  background: `${textColor}10`,
                  border: `1px solid ${textColor}20`,
                }}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default content layout
    return (
      <>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${accentColor}, ${adjustColor(accentColor, 40)})`,
        }} />

        <h2 style={{
          fontSize: '48px',
          fontWeight: 700,
          margin: 0,
          marginBottom: '40px',
          opacity: getOpacity(0),
          transform: `translateX(${Math.max(0, 30 - frame * 1.5)}px)`,
        }}>
          {slide.title}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: slide.bullets && slide.bullets.length > 2 ? 'repeat(2, 1fr)' : '1fr',
          gap: '16px',
          flex: 1,
          alignContent: 'start',
        }}>
          {slide.bullets?.map((bullet, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              borderLeft: `4px solid ${accentColor}`,
              opacity: getOpacity(10 + i * 6),
              transform: `translateY(${getTranslateY(10 + i * 6)}px)`,
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: accentColor,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontSize: '18px',
                lineHeight: 1.6,
              }}>
                {bullet}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: bgStyle,
      color: textColor,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${adjustColor(accentColor, -30)}15 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '60px 80px',
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

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

  // Fade in and scale animation for the whole slide
  const opacity = Math.min(1, frame / 10);
  const scale = 0.98 + (0.02 * Math.min(1, frame / 15));

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <SlideContentRemote slide={slide} frame={frame} />
    </AbsoluteFill>
  );
};

function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));

  if (color?.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = clamp(parseInt(hex[0] + hex[0], 16) + amount);
      const g = clamp(parseInt(hex[1] + hex[1], 16) + amount);
      const b = clamp(parseInt(hex[2] + hex[2], 16) + amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  }
  return color || '#1a1a2e';
}
