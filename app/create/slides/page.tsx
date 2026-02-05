'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Presentation, Wand2, Video, Loader2, Play, Save } from 'lucide-react'
import { useSlidesStore } from '@/lib/slidesStore'
import { Player } from '@remotion/player'
import { SlideComposition } from '@/components/remotion/SlideComposition'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { saveProject } from '@/lib/projects'
import { toast } from 'sonner'

export default function CreateSlidesPage() {
  const { 
    topic, setTopic, 
    style, setStyle,
    slideCount, setSlideCount,
    slides, setSlides,
    isGenerating, setIsGenerating
  } = useSlidesStore()

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const generateSlides = async () => {
    if (!topic) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/slides/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, count: slideCount })
      })
      const data = await res.json()
      if (data.slides) setSlides(data.slides)
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
        null // We don't have a single audio URL for slides yet
      )
      toast.success("Presentation saved to studio!")
    } catch (e) {
      toast.error("Failed to save project. Please login.")
    } finally {
      setIsSaving(false)
    }
  }

  const totalDuration = slides.reduce((acc, s) => acc + (s.duration ? Math.ceil(s.duration * 30) : 150), 0)

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-pink-500/30">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-[1600px]">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-pink-400 mb-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
              <Presentation className="w-3 h-3" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Visual Engine v2</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-100 to-pink-300">
              Slide Deck Studio
            </h1>
          </div>

          {slides.length > 0 && (
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              variant="outline" 
              className="border-pink-500/30 hover:bg-pink-500/10 text-pink-200"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
              Save Project
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-16rem)] overflow-hidden">
          {/* LEFT: Controls (Collapsible logic could be added here) */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presentation Topic</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-12 px-4 premium-input bg-black/40 text-sm focus:outline-none"
                  placeholder="e.g. Q3 Growth Strategy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aesthetic</label>
                  <select 
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full h-10 px-3 premium-input bg-black/40 text-sm focus:outline-none"
                  >
                    <option>Modern</option>
                    <option>Dark</option>
                    <option>Corporate</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Length</label>
                  <select 
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full h-10 px-3 premium-input bg-black/40 text-sm focus:outline-none"
                  >
                    <option value={3}>3 Slides</option>
                    <option value={5}>5 Slides</option>
                    <option value={10}>10 Slides</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={generateSlides}
                disabled={isGenerating || !topic}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 h-12 rounded-xl text-base font-bold shadow-lg shadow-pink-900/20"
              >
                {isGenerating ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Ideating...</> : <><Wand2 className="mr-2 w-5 h-5" /> Generate Deck</>}
              </Button>
            </div>

            {slides.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Actions</h3>
                <Button 
                  onClick={generateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-12 rounded-xl text-sm font-bold"
                >
                  {isGeneratingVideo ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Synthesizing...</> : <><Video className="mr-2 w-4 h-4" /> Create Video</>}
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT: Preview (Filmstrip + Player) */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Scrollable Slide List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
              {slides.length > 0 ? (
                slides.map((slide, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all shadow-2xl"
                    style={{ backgroundColor: slide.backgroundColor, color: slide.textColor }}
                  >
                    <div className="absolute top-4 left-4 text-[10px] font-mono opacity-50 border border-current px-2 py-0.5 rounded-full">
                      SLIDE {i + 1}
                    </div>
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
                      <ul className="text-sm opacity-80 space-y-1 text-left list-disc pl-4">
                        {slide.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Presentation className="w-16 h-16 opacity-20" />
                  <p>Your slides will appear here...</p>
                </div>
              )}
            </div>

            {/* Sticky Player Panel */}
            {slides.length > 0 && (
              <div className="w-[480px] shrink-0 flex flex-col gap-4">
                <div className="glass-panel p-1 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 sticky top-0">
                  {slides[0].audioUrl ? (
                    <Player
                      component={SlideComposition}
                      inputProps={{ slides }}
                      durationInFrames={totalDuration}
                      fps={30}
                      compositionWidth={1280}
                      compositionHeight={720}
                      style={{ width: '100%', height: 'auto', aspectRatio: '16/9', borderRadius: '12px' }}
                      controls
                    />
                  ) : (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Generate Video to Preview</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Speaker Notes Preview */}
                <div className="glass-panel p-6 rounded-2xl flex-1 overflow-y-auto">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Speaker Notes</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-mono">
                    {slides[0].speakerNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
