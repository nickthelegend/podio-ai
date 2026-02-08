"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    Presentation,
    Sparkles,
    ArrowUpIcon,
    Lightbulb,
    BarChart3,
    GraduationCap,
    Rocket,
    Building2,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface AIChatInputProps {
    onSubmit: (topic: string) => void;
    isLoading?: boolean;
    isCompact?: boolean;
}

const suggestionTopics = [
    { icon: <BarChart3 className="w-4 h-4" />, label: "Q3 Growth Strategy" },
    { icon: <GraduationCap className="w-4 h-4" />, label: "AI in Education" },
    { icon: <Rocket className="w-4 h-4" />, label: "Startup Pitch Deck" },
    { icon: <Building2 className="w-4 h-4" />, label: "Company Overview" },
    { icon: <Lightbulb className="w-4 h-4" />, label: "Product Launch" },
];

export function AIChatInput({ onSubmit, isLoading, isCompact }: AIChatInputProps) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSubmit(value.trim());
            }
        }
    };

    const handleSubmit = () => {
        if (value.trim() && !isLoading) {
            onSubmit(value.trim());
        }
    };

    const handleSuggestionClick = (topic: string) => {
        setValue(topic);
        onSubmit(topic);
    };

    if (isCompact) {
        return (
            <div className="w-full">
                <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-pink-500/5">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your presentation topic..."
                            className={cn(
                                "w-full px-5 py-4",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-end p-3 border-t border-white/5">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || !value.trim()}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                value.trim() && !isLoading
                                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/30 hover:shadow-pink-500/40 hover:scale-[1.02]"
                                    : "bg-white/5 text-zinc-500 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <ArrowUpIcon className="w-4 h-4" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-pink-400 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 backdrop-blur-sm">
                    <Presentation className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Slide Studio</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-100 to-pink-300">
                    What presentation can I create for you?
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Describe your topic and let AI craft beautiful, professional slides with stunning visuals
                </p>
            </div>

            <div className="w-full">
                <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-pink-500/10 hover:shadow-pink-500/20 transition-shadow duration-500">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 via-rose-500/10 to-purple-600/20 rounded-2xl blur-xl opacity-50" />

                    <div className="relative overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., A pitch deck for my AI-powered fitness app that helps users track workouts..."
                            className={cn(
                                "w-full px-6 py-5",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-base",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-base",
                                "min-h-[80px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="relative flex items-center justify-between p-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Powered by Gemini 3 Flash</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || !value.trim()}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                                value.trim() && !isLoading
                                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/30 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-white/5 text-zinc-500 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    Creating Magic...
                                </>
                            ) : (
                                <>
                                    <ArrowUpIcon className="w-4 h-4" />
                                    Generate Slides
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    <span className="text-xs text-neutral-600 mr-1">Try:</span>
                    {suggestionTopics.map((topic, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleSuggestionClick(topic.label)}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900/60 hover:bg-neutral-800/80 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all duration-200 hover:scale-[1.02] hover:border-pink-500/30"
                        >
                            {topic.icon}
                            <span className="text-xs font-medium">{topic.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
