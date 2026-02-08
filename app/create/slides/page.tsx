'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { AIChatInput } from '@/components/ui/ai-chat-input'
import { SlideRenderer } from '@/components/slides/SlideRenderer'
import { Presentation, Video, Loader2, Save, FileDown, Sparkles, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSlidesStore, EnhancedSlide } from '@/lib/slidesStore'
import { Player } from '@remotion/player'
import { SlideComposition } from '@/components/remotion/SlideComposition'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveProject } from '@/lib/projects'
import { toast } from 'sonner'
import { exportSlidesToPDF } from '@/lib/pdf'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateSlidesPage() {
  const router = useRouter()
  const slidesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
    }
    checkUser()
  }, [router])

  const {
    topic, setTopic,
    style, setStyle,
    slideCount, setSlideCount,
    slides, setSlides,
    isGenerating, setIsGenerating,
    hasSubmitted, setHasSubmitted,
    reset
  } = useSlidesStore()

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)

  const generateSlides = async (inputTopic?: string) => {
    const topicToUse = inputTopic || topic
    if (!topicToUse) return

    setTopic(topicToUse)
    setHasSubmitted(true)
    setIsGenerating(true)

    try {
      const res = await fetch('/api/slides/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse, style, count: slideCount })
      })
      const data = await res.json()
      if (data.slides) {
        setSlides(data.slides)
        setSelectedSlideIndex(0)
      }
    } catch (e) {
      toast.error("Failed to generate slides")
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (slides.length === 0) return
    setIsGeneratingVideo(true)
    const newSlides = [...slides]

    await Promise.all(newSlides.map(async (slide, index) => {
      const res = await fetch('/api/podcast/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: [{ speaker: 'Presenter', line: slide.speakerNotes }],
          language: 'en-US'
        })
      })
      const data = await res.json()
      if (data.audio) {
        newSlides[index].audioUrl = `data:audio/mp3;base64,${data.audio}`
        newSlides[index].duration = Math.max(5, slide.speakerNotes.split(' ').length / 2.5)
      }
    }))
    setSlides(newSlides)
    setIsGeneratingVideo(false)
  }

  const handleSave = async () => {
    if (!slides.length) return
    setIsSaving(true)
    try {
      await saveProject(
        topic.slice(0, 50) || 'Untitled Slides',
        'slides',
        { topic, style, slides },
        null
      )
      toast.success("Presentation saved to studio!")
    } catch (e) {
      toast.error("Failed to save project. Please login.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!slides.length) return
    setIsExportingPDF(true)
    try {
      await exportSlidesToPDF(slides, topic || 'Presentation')
      toast.success("PDF Downloaded!")
    } catch (e) {
      toast.error("Failed to export PDF")
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleReset = () => {
    reset()
    setSelectedSlideIndex(0)
  }

  const scrollToSlide = (index: number) => {
    setSelectedSlideIndex(index)
    const slideElements = slidesContainerRef.current?.children
    if (slideElements && slideElements[index]) {
      slideElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const totalDuration = slides.reduce((acc, s) => acc + (s.duration ? Math.ceil(s.duration * 30) : 150), 0)

  // Initial state - show centered AI chat input
  if (!hasSubmitted) {
    return (
      <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30">
        <Header />

        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-rose-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <main className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <AIChatInput
              onSubmit={generateSlides}
              isLoading={isGenerating}
            />
          </motion.div>

          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex items-center gap-4 text-sm"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-gray-400">Style:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="Modern" className="bg-neutral-900">Modern</option>
                <option value="Dark" className="bg-neutral-900">Dark</option>
                <option value="Corporate" className="bg-neutral-900">Corporate</option>
                <option value="Creative" className="bg-neutral-900">Creative</option>
                <option value="Minimal" className="bg-neutral-900">Minimal</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-gray-400">Slides:</span>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value={3} className="bg-neutral-900">3</option>
                <option value={5} className="bg-neutral-900">5</option>
                <option value={7} className="bg-neutral-900">7</option>
                <option value={10} className="bg-neutral-900">10</option>
              </select>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  // Submitted state - slides editor view with sticky input at bottom
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30">
      <Header />

      {/* Fixed Header Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-[#030014]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                <Presentation className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">AI Generated</span>
              </div>
              <h1 className="text-xl font-bold text-white truncate max-w-md">
                {topic}
              </h1>
              <span className="text-sm text-gray-500">
                {slides.length} slides
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 text-gray-400"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                New
              </Button>

              {slides.length > 0 && (
                <>
                  <Button
                    onClick={generateVideo}
                    disabled={isGeneratingVideo}
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 text-gray-300"
                  >
                    {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Video className="w-4 h-4 mr-1" />}
                    Video
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 text-gray-300"
                  >
                    {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileDown className="w-4 h-4 mr-1" />}
                    PDF
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 pt-36 pb-48 max-w-[1200px]">
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-pink-400" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-3">Creating Your Presentation</h2>
                <p className="text-gray-400 text-lg">Gemini is crafting stunning slides with custom HTML/CSS...</p>
              </div>
            </motion.div>
          ) : slides.length > 0 ? (
            <motion.div
              key="slides"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              ref={slidesContainerRef}
            >
              {/* Single Column Slides - Full Width */}
              {slides.map((slide, i) => (
                <SlideRenderer
                  key={i}
                  slide={slide}
                  index={i}
                  isSelected={selectedSlideIndex === i}
                  onClick={() => setSelectedSlideIndex(i)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
            >
              <Presentation className="w-16 h-16 text-gray-700" />
              <p className="text-gray-500">Generate slides to get started</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide Navigator - Fixed at bottom left */}
      {slides.length > 0 && !isGenerating && (
        <div className="fixed bottom-24 left-6 z-40 flex items-center gap-2 bg-neutral-900/90 backdrop-blur-xl rounded-full px-2 py-1 border border-white/10 shadow-2xl">
          <button
            onClick={() => scrollToSlide(Math.max(0, selectedSlideIndex - 1))}
            disabled={selectedSlideIndex === 0}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === selectedSlideIndex
                    ? 'bg-pink-500 scale-125'
                    : 'bg-white/20 hover:bg-white/40'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollToSlide(Math.min(slides.length - 1, selectedSlideIndex + 1))}
            disabled={selectedSlideIndex === slides.length - 1}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Speaker Notes Panel - Fixed at bottom right */}
      {slides.length > 0 && !isGenerating && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Speaker Notes
            </h4>
            <span className="text-xs text-pink-400">Slide {selectedSlideIndex + 1}</span>
          </div>
          <div className="px-4 py-3 max-h-32 overflow-y-auto custom-scrollbar">
            <p className="text-sm text-gray-300 leading-relaxed">
              {slides[selectedSlideIndex]?.speakerNotes}
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent pt-8 pb-6 px-6 z-30">
        <div className="container mx-auto max-w-4xl">
          <AIChatInput
            onSubmit={generateSlides}
            isLoading={isGenerating}
            isCompact
          />
        </div>
      </div>
    </div>
  )
}
