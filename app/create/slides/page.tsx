'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Presentation, Wand2, Play, Loader2, Video } from 'lucide-react'
import { useSlidesStore, Slide } from '@/lib/slidesStore'
import { Player } from '@remotion/player'
import { SlideComposition } from '@/components/remotion/SlideComposition'
import { useState } from 'react'

export default function CreateSlidesPage() {
  const { 
    topic, setTopic, 
    style, setStyle,
    slideCount, setSlideCount,
    slides, setSlides, updateSlide,
    isGenerating, setIsGenerating
  } = useSlidesStore()

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

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
      if (data.slides) {
        setSlides(data.slides)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateVideo = async () => {
    if (slides.length === 0) return
    setIsGeneratingVideo(true)
    
    // 1. Generate Audio for each slide concurrently
    const newSlides = [...slides]
    
    await Promise.all(newSlides.map(async (slide, index) => {
        // Use the podcast TTS API for speaker notes
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
            // Estimate duration (rough approx: 15 chars per sec or use actual metadata if we decoded it)
            // For MVP, we will use a rough estimate: words / 2.5 (avg speaking rate)
            const wordCount = slide.speakerNotes.split(' ').length
            newSlides[index].duration = Math.max(5, wordCount / 2.5) 
        }
    }))

    setSlides(newSlides)
    setIsGeneratingVideo(false)
  }

  // Calculate total duration for the player
  const totalDurationInFrames = slides.reduce((acc, slide) => {
      return acc + (slide.duration ? Math.ceil(slide.duration * 30) : 150)
  }, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-6xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-pink-400 mb-2">
            <Presentation className="w-4 h-4" /> 
            <span className="text-sm font-medium uppercase tracking-wider">Presentation Engine</span>
          </div>
          <h1 className="text-4xl font-bold">New Slide Deck</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Topic</label>
                    <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="e.g. The Future of AI"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Style</label>
                    <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <option>Modern</option>
                        <option>Dark</option>
                        <option>Corporate</option>
                    </select>
                    </div>
                    <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Slide Count</label>
                    <select 
                        value={slideCount}
                        onChange={(e) => setSlideCount(Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-base font-bold"
                >
                    {isGenerating ? (
                    <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Generating Content...</>
                    ) : (
                    <><Wand2 className="mr-2 w-5 h-5" /> Generate Deck</>
                    )}
                </Button>
            </div>

            {slides.length > 0 && (
                <Button 
                    onClick={generateVideo}
                    disabled={isGeneratingVideo}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold"
                >
                    {isGeneratingVideo ? (
                    <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Synthesizing Video...</>
                    ) : (
                    <><Video className="mr-2 w-5 h-5" /> Generate Video Presentation</>
                    )}
                </Button>
            )}
          </div>

          {/* Preview */}
          <div className="lg:col-span-8 space-y-6">
            {slides.length > 0 ? (
                <>
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
                        {slides[0].audioUrl ? (
                             <Player
                                component={SlideComposition}
                                inputProps={{ slides }}
                                durationInFrames={totalDurationInFrames}
                                fps={30}
                                compositionWidth={1280}
                                compositionHeight={720}
                                style={{
                                width: '100%',
                                height: '100%',
                                }}
                                controls
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                <Presentation className="w-16 h-16 mb-4 opacity-20" />
                                <p>Generate Video to preview animation & audio</p>
                            </div>
                        )}
                    </div>

                    {/* Static Slide Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {slides.map((slide, i) => (
                            <div 
                                key={i} 
                                style={{ backgroundColor: slide.backgroundColor, color: slide.textColor }}
                                className="aspect-video rounded-lg p-3 text-[8px] overflow-hidden border border-white/10 cursor-pointer hover:ring-2 ring-pink-500 transition-all"
                            >
                                <h3 className="font-bold mb-1 truncate">{slide.title}</h3>
                                <ul className="list-disc pl-3 space-y-0.5 opacity-70">
                                    {slide.bullets.slice(0, 3).map((b, j) => <li key={j} className="truncate">{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                    <Presentation className="w-16 h-16 mb-4 opacity-20" />
                    <p>Enter a topic to generate your deck</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
