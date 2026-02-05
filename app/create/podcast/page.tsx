'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Mic, Wand2, Play, Download, Loader2 } from 'lucide-react'
import { usePodcastStore } from '@/lib/store'
import { useState } from 'react'
import { AudioPlayer } from '@/components/AudioPlayer' // New Import

export default function CreatePodcastPage() {
  const { 
    topic, setTopic, 
    language, setLanguage,
    script, setScript,
    audioUrl, setAudioUrl,
    isGeneratingScript, setIsGeneratingScript,
    isGeneratingAudio, setIsGeneratingAudio
  } = usePodcastStore()

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
      if (data.dialogue) {
        setScript(data.dialogue)
      }
    } catch (e) {
      console.error(e)
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
      if (data.audio) {
        setAudioUrl(`data:audio/mp3;base64,${data.audio}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `podio-cast-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-purple-400 mb-2">
            <Mic className="w-4 h-4" /> 
            <span className="text-sm font-medium uppercase tracking-wider">Audio Engine</span>
          </div>
          <h1 className="text-4xl font-bold">New Podcast</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Topic</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Describe your podcast topic..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (India)</option>
              </select>
            </div>

            <Button 
              onClick={generateScript}
              disabled={isGeneratingScript || !topic}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold"
            >
              {isGeneratingScript ? (
                <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Writing Script...</>
              ) : (
                <><Wand2 className="mr-2 w-5 h-5" /> Generate Script</>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10 h-fit">
            <h2 className="text-xl font-bold">Preview</h2>
            
            {script.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-4 pr-2 text-sm text-gray-300 custom-scrollbar">
                  {script.map((line, i) => (
                    <div key={i} className={`p-3 rounded-lg ${line.speaker === 'Speaker R' ? 'bg-purple-500/10 border-l-2 border-purple-500' : 'bg-pink-500/10 border-l-2 border-pink-500'}`}>
                      <span className="text-xs font-bold opacity-50 block mb-1">{line.speaker}</span>
                      {line.line}
                    </div>
                  ))}
                </div>

                {audioUrl ? (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <AudioPlayer audioUrl={audioUrl} onDownload={handleDownload} />
                  </div>
                ) : (
                  <Button 
                    onClick={generateAudio}
                    disabled={isGeneratingAudio}
                    className="w-full bg-green-600 hover:bg-green-700 font-bold"
                  >
                    {isGeneratingAudio ? (
                      <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Synthesizing Audio...</>
                    ) : (
                      <><Play className="mr-2 w-5 h-5" /> Generate Audio</>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                Generated script will appear here...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
