'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EnhancedSlide } from '@/lib/slidesStore';
import DOMPurify from 'dompurify';

interface SlideRendererProps {
    slide: EnhancedSlide;
    index: number;
    isSelected?: boolean;
    onClick?: () => void;
}

// Safely render HTML content
export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, index, isSelected, onClick }) => {
    const sanitizedHtml = useMemo(() => {
        if (!slide.htmlContent) return null;

        // Check if DOMPurify is available (client-side only)
        if (typeof window !== 'undefined') {
            return DOMPurify.sanitize(slide.htmlContent, {
                ADD_TAGS: ['style'],
                ADD_ATTR: ['style'],
                FORCE_BODY: true,
            });
        }
        return slide.htmlContent;
    }, [slide.htmlContent]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={onClick}
            className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-pink-500/20 ${isSelected
                    ? 'border-pink-500 ring-4 ring-pink-500/30'
                    : 'border-white/10 hover:border-pink-500/50'
                }`}
        >
            {/* Slide Number Badge */}
            <div className="absolute top-4 left-4 z-20 text-[10px] font-mono opacity-80 border border-white/30 px-3 py-1 rounded-full backdrop-blur-md bg-black/40 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                SLIDE {index + 1}
            </div>

            {/* Layout Type Badge */}
            <div className="absolute top-4 right-4 z-20 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md bg-pink-500/30 text-pink-200 border border-pink-500/40">
                {slide.layoutType || 'content'}
            </div>

            {/* Rendered HTML Content */}
            {sanitizedHtml ? (
                <div
                    className="w-full h-full slide-content"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            ) : (
                <FallbackSlide slide={slide} />
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                    <p className="text-sm font-medium opacity-80">Click to select</p>
                </div>
            </div>
        </motion.div>
    );
};

// Fallback slide when no HTML content is available
const FallbackSlide: React.FC<{ slide: EnhancedSlide }> = ({ slide }) => (
    <div
        className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
        style={{
            background: slide.gradient || `linear-gradient(135deg, ${slide.backgroundColor} 0%, ${adjustColor(slide.backgroundColor, -30)} 100%)`,
            color: slide.textColor
        }}
    >
        {/* Decorative Elements */}
        <div
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${slide.accentColor || '#ec4899'} 0%, transparent 70%)` }}
        />

        <h2 className="text-4xl font-bold mb-6">{slide.title}</h2>

        <ul className="space-y-3 text-left">
            {slide.bullets?.map((bullet, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: slide.accentColor || '#ec4899' }}
                    />
                    {bullet}
                </li>
            ))}
        </ul>
    </div>
);

// Helper to adjust color brightness
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
    return color || '#1a1a2e';
}

export default SlideRenderer;
