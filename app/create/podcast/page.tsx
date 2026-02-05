'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Mic, Wand2, Play, Download, Loader2, MessageSquare, ChevronDown, ChevronUp, Save } from 'lucide-react'
import { usePodcastStore } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { AudioPlayer } from '@/components/AudioPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import { saveProject } from '@/lib/projects'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatePodcastPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
    }
    checkUser()
  }, [router])
  const {
    topic, setTopic,
    language, setLanguage,
    script, setScript,
    audioUrl, setAudioUrl,
    isGeneratingScript, setIsGeneratingScript,
    isGeneratingAudio, setIsGeneratingAudio
  } = usePodcastStore()

  const [isScriptExpanded, setIsScriptExpanded] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [script])

  const generateScript = async () => {
    if (!topic) return
    setIsGeneratingScript(true)
    try {
      const res = await fetch('/api/podcast/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language })
      })
      const data = await res.json()
      if (data.dialogue) setScript(data.dialogue)
    } catch (e) {
      toast.error("Failed to generate script")
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const generateAudio = async () => {
    if (script.length === 0) return
    setIsGeneratingAudio(true)
    try {
      const res = await fetch('/api/podcast/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, language })
      })
      const data = await res.json()
      if (data.audio) setAudioUrl(`data:audio/mp3;base64,${data.audio}`)
    } catch (e) {
      toast.error("Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleSave = async () => {
    if (!script.length) return
    setIsSaving(true)
    try {
      await saveProject(
        topic.slice(0, 50) || 'Untitled Podcast',
        'podcast',
        { topic, language, script },
        audioUrl
      )
      toast.success("Podcast saved to studio!")
    } catch (e) {
      toast.error("Failed to save project. Please login.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-purple-400 mb-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Mic className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Audio Engine v2</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
              Podcast Studio
            </h1>
          </div>

          {script.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/10 text-purple-200"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Project
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-16rem)]">
          {/* LEFT: Controls */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
            <div className="glass-panel p-6 rounded-3xl space-y-6 flex-1">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Topic / Source Material</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-40 p-4 premium-input bg-black/40 text-sm resize-none focus:outline-none"
                  placeholder="Paste an article, blog post, or describe a topic..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 px-3 premium-input bg-black/40 text-sm focus:outline-none"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">Hindi (India)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vibe</label>
                  <select className="w-full h-10 px-3 premium-input bg-black/40 text-sm focus:outline-none">
                    <option>Casual</option>
                    <option>News</option>
                    <option>Deep Dive</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={generateScript}
                disabled={isGeneratingScript || !topic}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 h-12 rounded-xl text-base font-bold shadow-lg shadow-purple-900/20"
              >
                {isGeneratingScript ? (
                  <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Wand2 className="mr-2 w-5 h-5" /> Generate Script</>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT: Chat & Audio */}
          <div className="lg:col-span-8 flex flex-col h-full gap-6">
            {/* Script Chat Area */}
            <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden relative">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" /> Script Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                  className="h-6 w-6 p-0 hover:bg-white/10"
                >
                  {isScriptExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              <AnimatePresence>
                {isScriptExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-black/20"
                  >
                    {script.length > 0 ? (
                      script.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex ${line.speaker === 'Speaker R' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`chat-bubble ${line.speaker === 'Speaker R' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                            <div className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-wider">
                              {line.speaker}
                            </div>
                            {line.line}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Mic className="w-8 h-8 opacity-20" />
                        </div>
                        <p>AI script will appear here...</p>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Audio Player Sticky Bottom */}
            <div className="glass-panel p-6 rounded-3xl shrink-0">
              {audioUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Ready to Play
                    </span>
                  </div>
                  <AudioPlayer audioUrl={audioUrl} />
                </div>
              ) : (
                <Button
                  onClick={generateAudio}
                  disabled={isGeneratingAudio || script.length === 0}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-14 rounded-xl text-base font-bold text-gray-300 hover:text-white transition-all"
                >
                  {isGeneratingAudio ? (
                    <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Synthesizing Voice...</>
                  ) : (
                    <><Play className="mr-2 w-5 h-5 fill-current" /> Generate Audio Preview</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
