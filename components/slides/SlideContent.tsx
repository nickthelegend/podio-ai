import React from 'react';
import { EnhancedSlide, BrandKit } from '@/lib/slidesStore';

interface SlideContentProps {
    slide: EnhancedSlide;
    brand?: BrandKit | null;
    frame?: number; // For animations in Remotion
    isStatic?: boolean; // For static rendering (no animations)
}

// Shared slide content rendering - used by both SlideRenderer and SlideComposition
export const SlideContent: React.FC<SlideContentProps> = ({ slide, brand, frame = 100, isStatic = false }) => {
    // Animation helpers
    const getOpacity = (delay: number = 0) => isStatic ? 1 : Math.min(1, (frame - delay) / 15);
    const getTranslateY = (delay: number = 0) => isStatic ? 0 : Math.max(0, 20 - (frame - delay));
    const getScale = (base: number = 1, amount: number = 0.05) => isStatic ? 1 : base + (amount * Math.min(1, frame / 20));

    // Brand Overrides
    const primaryColor = brand?.primaryColor || slide.accentColor || '#ec4899';
    const secondaryColor = brand?.secondaryColor || adjustColor(primaryColor, -30);
    const fontFamily = brand?.fontFamily || "'Segoe UI', system-ui, -apple-system, sans-serif";

    const bgStyle = slide.gradient ||
        `linear-gradient(135deg, ${slide.backgroundColor || '#0a0a0f'} 0%, ${adjustColor(slide.backgroundColor || '#0a0a0f', -30)} 100%)`;

    const textColor = slide.textColor || '#ffffff';

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: bgStyle,
            color: textColor,
            fontFamily: fontFamily,
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${primaryColor}25 0%, transparent 70%)`,
                filter: 'blur(40px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-100px',
                left: '-100px',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${secondaryColor}15 0%, transparent 70%)`,
                filter: 'blur(40px)',
            }} />

            {/* Grid pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
            }} />

            {/* Brand Logo */}
            {brand?.logoUrl && (
                <div style={{
                    position: 'absolute',
                    top: '32px',
                    right: '32px',
                    zIndex: 20,
                    width: '48px',
                    height: '48px',
                    backgroundImage: `url(${brand.logoUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    opacity: 0.8
                }} />
            )}

            {/* Content based on layout type */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '60px 80px',
            }}>
                {slide.layoutType === 'title' ? (
                    <TitleLayout
                        slide={slide}
                        getOpacity={getOpacity}
                        getTranslateY={getTranslateY}
                        accentColor={primaryColor}
                        textColor={textColor}
                    />
                ) : slide.layoutType === 'statistics' ? (
                    <StatisticsLayout
                        slide={slide}
                        getOpacity={getOpacity}
                        getTranslateY={getTranslateY}
                        accentColor={primaryColor}
                        textColor={textColor}
                    />
                ) : slide.layoutType === 'conclusion' ? (
                    <ConclusionLayout
                        slide={slide}
                        getOpacity={getOpacity}
                        textColor={textColor}
                    />
                ) : (
                    <ContentLayout
                        slide={slide}
                        getOpacity={getOpacity}
                        getTranslateY={getTranslateY}
                        accentColor={primaryColor}
                    />
                )}
            </div>
        </div>
    );
};

// Title Slide Layout
const TitleLayout: React.FC<{
    slide: EnhancedSlide;
    getOpacity: (delay?: number) => number;
    getTranslateY: (delay?: number) => number;
    accentColor: string;
    textColor: string;
}> = ({ slide, getOpacity, getTranslateY, accentColor, textColor }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
    }}>
        {/* Badge */}
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

        {/* Main Title */}
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

        {/* Subtitle/Description */}
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

// Statistics Layout
const StatisticsLayout: React.FC<{
    slide: EnhancedSlide;
    getOpacity: (delay?: number) => number;
    getTranslateY: (delay?: number) => number;
    accentColor: string;
    textColor: string;
}> = ({ slide, getOpacity, getTranslateY, accentColor, textColor }) => (
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
                // Try to parse "value: label" format, otherwise use the whole string
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

// Conclusion Layout
const ConclusionLayout: React.FC<{
    slide: EnhancedSlide;
    getOpacity: (delay?: number) => number;
    textColor: string;
}> = ({ slide, getOpacity, textColor }) => (
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

// Default Content Layout
const ContentLayout: React.FC<{
    slide: EnhancedSlide;
    getOpacity: (delay?: number) => number;
    getTranslateY: (delay?: number) => number;
    accentColor: string;
}> = ({ slide, getOpacity, getTranslateY, accentColor }) => (
    <>
        {/* Top accent line */}
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
            transform: `translateX(${Math.max(0, 30 - getTranslateY(0) * 1.5)}px)`,
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

// Helper to adjust color brightness
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

export default SlideContent;
