'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedSlide, BrandKit } from '@/lib/slidesStore';
import SlideContent from './SlideContent';
import { ArrowRight } from 'lucide-react';

interface SlideRendererProps {
    slide: EnhancedSlide;
    index: number;
    format?: '16:9' | '4:5' | '9:16';
    brand?: BrandKit | null;
    isSelected?: boolean;
    onClick?: () => void;
}

// Renders slides in the editor view
export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, index, format = '16:9', brand, isSelected, onClick }) => {

    // Determine aspect ratio class/style
    const getAspectRatioStyle = () => {
        switch (format) {
            case '4:5': return { aspectRatio: '4/5', maxWidth: '600px' };
            case '9:16': return { aspectRatio: '9/16', maxWidth: '400px' };
            default: return { aspectRatio: '16/9', maxWidth: '100%' };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={onClick}
            style={getAspectRatioStyle()}
            className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl hover:shadow-pink-500/20 mx-auto ${isSelected
                ? 'border-pink-500 ring-4 ring-pink-500/30'
                : 'border-white/10 hover:border-pink-500/50'
                }`}
        >
            {/* Slide Number Badge */}
            <div className="absolute top-4 left-4 z-20 text-[10px] font-mono opacity-80 border border-white/30 px-3 py-1 rounded-full backdrop-blur-md bg-black/40 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                {format === '4:5' ? `${index + 1}` : `SLIDE ${index + 1}`}
            </div>

            {/* Format-specific Indicators */}
            {format === '4:5' && (
                <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1 text-white/50 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                    Swipe <ArrowRight className="w-3 h-3" />
                </div>
            )}

            {/* Layout Type Badge */}
            <div className="absolute top-4 right-4 z-20 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md bg-pink-500/30 text-pink-200 border border-pink-500/40">
                {slide.layoutType || 'content'}
            </div>

            {/* Use shared SlideContent component - static rendering for editor */}
            <SlideContent slide={slide} isStatic={true} brand={brand} />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                    <p className="text-sm font-medium opacity-80">Click to select</p>
                </div>
            </div>
        </motion.div>
    );
};

export default SlideRenderer;
