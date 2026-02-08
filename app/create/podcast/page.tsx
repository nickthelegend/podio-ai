'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { AIChatInput } from '@/components/ui/ai-chat-input'
import { Mic, Wand2, Play, Download, Loader2, MessageSquare, Save, Languages, FileText, Sparkles, User, UserCircle } from 'lucide-react'
import { usePodcastStore } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { AudioPlayer } from '@/components/AudioPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import { saveProject } from '@/lib/projects'
import { toast } from 'sonner'

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'ta-IN', name: 'Tamil (India)' },
  { code: 'te-IN', name: 'Telugu (India)' },
]

export default function CreatePodcastPage() {
  const {
    topic, setTopic,
    language, setLanguage,
    script, setScript,
    audioUrl, setAudioUrl,
    isGeneratingScript, setIsGeneratingScript,
    isGeneratingAudio, setIsGeneratingAudio
  } = usePodcastStore()

  const [hasStarted, setHasStarted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (script.length > 0) {
      setHasStarted(true)
    }
  }, [script])

  useEffect(() => {
    if (hasStarted) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [script, hasStarted])

  const generateScript = async (inputTopic?: string) => {
    const topicToUse = inputTopic || topic
    if (!topicToUse) return

    setTopic(topicToUse)
    setHasStarted(true)
    setIsGeneratingScript(true)

    try {
      const res = await fetch('/api/podcast/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse, language })
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
      else toast.error(data.error || "Failed to generate audio")
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

  const exportTranscript = () => {
    if (!script.length) return
    const content = script.map(line => `${line.speaker}: ${line.line}`).join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic.slice(0, 30).replace(/\s+/g, '_')}_transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Transcript exported!")
  }

  // Initial State: Centered AI Chat Input
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
        <Header />

        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <main className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            <AIChatInput
              onSubmit={generateScript}
              isLoading={isGeneratingScript}
              title="Transform any topic into a Podcast"
              subtitle="Paste a link, an article, or just describe your idea. AI will craft a natural conversation between two hosts."
              placeholder="e.g., A deep dive into the future of AI agents in 2026..."
              label="Audio Studio"
              loadingText="Drafting Script..."
            />

            {/* Language Selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex justify-center items-center gap-4 text-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Languages className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Output Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code} className="bg-neutral-900">{l.name}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    )
  }

  // Active State: Chat Interface
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
      <Header />

      {/* Fixed Header Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-[#030014]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 max-w-[1200px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Mic className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Audio Engine v2</span>
              </div>
              <h1 className="text-lg font-bold text-white truncate max-w-md">
                {topic}
              </h1>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={exportTranscript}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 text-gray-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Transcript
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 pt-36 pb-48 max-w-[1000px]">
        <AnimatePresence mode="wait">
          {isGeneratingScript && script.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Topic</h2>
                <p className="text-gray-400">Gemini is drafting your podcast script...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {script.map((line, i) => {
                const isHost = line.speaker === 'Host' || line.speaker === 'Speaker R';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isHost ? -20 : 20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${isHost ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div className={`flex items-center gap-2 mb-1 ${isHost ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isHost ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {isHost ? 'R' : 'S'}
                        </div>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                          {isHost ? 'Speaker R (Host)' : 'Speaker S (Guest)'}
                        </span>
                      </div>
                      <div className={`chat-bubble ${isHost ? 'chat-bubble-host' : 'chat-bubble-guest'}`}>
                        {line.line}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent pt-12 pb-8 px-6 z-30">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Audio Player */}
          <AnimatePresence>
            {script.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-4 rounded-2xl"
              >
                {audioUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <AudioPlayer audioUrl={audioUrl} />
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={generateAudio}
                    disabled={isGeneratingAudio}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 h-12 rounded-xl text-sm font-bold text-gray-300 transition-all"
                  >
                    {isGeneratingAudio ? (
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Synthesizing Voice...</>
                    ) : (
                      <><Play className="mr-2 w-4 h-4 fill-current" /> Generate Audio Preview</>
                    )}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* New AIChatInput at bottom */}
          <AIChatInput
            onSubmit={generateScript}
            isLoading={isGeneratingScript}
            isCompact
            placeholder="Refine this script or create a new one..."
            loadingText="Updating..."
          />
        </div>
      </div>
    </div>
  )
}
