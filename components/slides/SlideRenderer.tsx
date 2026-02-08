'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedSlide } from '@/lib/slidesStore';
import SlideContent from './SlideContent';

interface SlideRendererProps {
    slide: EnhancedSlide;
    index: number;
    isSelected?: boolean;
    onClick?: () => void;
}

// Renders slides in the editor view
export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, index, isSelected, onClick }) => {
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

            {/* Use shared SlideContent component - static rendering for editor */}
            <SlideContent slide={slide} isStatic={true} />

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
