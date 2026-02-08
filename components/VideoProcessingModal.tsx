'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Video, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoProcessingModalProps {
    isOpen: boolean
    onClose: () => void
    status: 'processing' | 'complete' | 'error'
    progress?: number
    currentSlide?: number
    totalSlides?: number
    onViewVideo?: () => void
}

export function VideoProcessingModal({
    isOpen,
    onClose,
    status,
    progress = 0,
    currentSlide = 0,
    totalSlides = 0,
    onViewVideo,
}: VideoProcessingModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={status !== 'processing' ? onClose : undefined}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            {/* Header Gradient */}
                            <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

                            <div className="p-8">
                                {status === 'processing' && (
                                    <div className="text-center">
                                        {/* Animated Icon */}
                                        <div className="relative w-24 h-24 mx-auto mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
                                            <div
                                                className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"
                                                style={{ animationDuration: '1.5s' }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Video className="w-10 h-10 text-pink-400" />
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Creating Your Video
                                        </h2>
                                        <p className="text-gray-400 mb-6">
                                            Synthesizing audio and rendering slides...
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">
                                                Slide {currentSlide} of {totalSlides}
                                            </span>
                                            <span className="text-pink-400 font-medium">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>

                                        {/* Processing Steps */}
                                        <div className="mt-6 space-y-2 text-left">
                                            <ProcessingStep
                                                label="Generating voiceover audio"
                                                isComplete={currentSlide > 0}
                                                isActive={currentSlide === 0}
                                            />
                                            <ProcessingStep
                                                label="Processing slide animations"
                                                isComplete={progress > 50}
                                                isActive={progress <= 50 && progress > 0}
                                            />
                                            <ProcessingStep
                                                label="Rendering final video"
                                                isComplete={progress === 100}
                                                isActive={progress > 50 && progress < 100}
                                            />
                                        </div>
                                    </div>
                                )}

                                {status === 'complete' && (
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <CheckCircle className="w-10 h-10 text-green-400" />
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Video Ready! 🎉
                                        </h2>
                                        <p className="text-gray-400 mb-6">
                                            Your presentation video has been generated successfully.
                                        </p>

                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                onClick={onClose}
                                                variant="outline"
                                                className="border-white/10 hover:bg-white/5 text-gray-300"
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                onClick={onViewVideo}
                                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                View & Export
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <XCircle className="w-10 h-10 text-red-400" />
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Something went wrong
                                        </h2>
                                        <p className="text-gray-400 mb-6">
                                            Failed to generate video. Please try again.
                                        </p>

                                        <Button
                                            onClick={onClose}
                                            variant="outline"
                                            className="border-white/10 hover:bg-white/5 text-gray-300"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function ProcessingStep({ label, isComplete, isActive }: { label: string; isComplete: boolean; isActive: boolean }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-500/20' : isActive ? 'bg-pink-500/20' : 'bg-white/5'
                }`}>
                {isComplete ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                ) : isActive ? (
                    <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
            </div>
            <span className={isComplete ? 'text-gray-400' : isActive ? 'text-white' : 'text-gray-600'}>
                {label}
            </span>
        </div>
    )
}
