'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mic, Play, Loader2, Calendar, TrendingUp, RefreshCw, Save, Volume2, Clock } from 'lucide-react'
import { AudioPlayer } from '@/components/AudioPlayer'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface NewsItem {
  title: string
  excerpt: string
  time: string
  category: string
  link: string
}

interface NewsPodcast {
  id: string
  date: string
  headlines: string[]
  script: { speaker: string; line: string }[]
  audioUrl?: string
  language: string
  createdAt: number
}

const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
]

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [podcasts, setPodcasts] = useState<NewsPodcast[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
    fetchPodcasts()
  }, [])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (data.news) {
        setNews(data.news)
      }
    } catch (e) {
      toast.error("Failed to fetch news")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPodcasts = async () => {
    try {
      const res = await fetch('/api/news/podcasts')
      const data = await res.json()
      if (data.podcasts) {
        setPodcasts(data.podcasts)
      }
    } catch (e) {
      console.error("Failed to fetch podcasts", e)
    }
  }

  const generatePodcast = async (date: string, headlines: string[]) => {
    setIsGenerating(true)
    setGeneratingFor(date)
    try {
      const res = await fetch('/api/news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlines, language: selectedLanguage })
      })
      const data = await res.json()
      
      if (data.script) {
        // Generate audio
        const ttsRes = await fetch('/api/podcast/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: data.script, language: selectedLanguage })
        })
        const ttsData = await ttsRes.json()
        
        const newPodcast: NewsPodcast = {
          id: Date.now().toString(),
          date,
          headlines,
          script: data.script,
          audioUrl: ttsData.audio ? `data:audio/mp3;base64,${ttsData.audio}` : undefined,
          language: selectedLanguage,
          createdAt: Date.now()
        }
        
        setPodcasts(prev => [newPodcast, ...prev])
        toast.success("News podcast generated!")
      }
    } catch (e) {
      toast.error("Failed to generate podcast")
    } finally {
      setIsGenerating(false)
      setGeneratingFor(null)
    }
  }

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date().toLocaleDateString('en-US', options)
  }

  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0]
  }

  const headlines = news.map(n => n.title)

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <Header />

      <main className="container mx-auto px-6 pt-32 pb-16 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-red-200">
              Daily News
            </h1>
          </div>
          <p className="text-gray-400">Get your daily news podcast from Economic Times</p>
        </motion.div>

        {/* Language Selector */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-sm text-gray-400">Language:</span>
          <div className="flex gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLanguage === lang.code
                    ? 'bg-orange-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* News Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Today&apos;s Headlines
              </h2>
              <Button
                onClick={fetchNews}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-3">
                {news.map((item, i) => (
                  <motion.a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block p-4 rounded-xl glass-panel hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm group-hover:text-orange-400 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                No news available. Click refresh to try again.
              </div>
            )}

            {/* Generate Button */}
            {headlines.length > 0 && (
              <Button
                onClick={() => generatePodcast(getTodayKey(), headlines)}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 h-12"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Mic className="w-5 h-5 mr-2" />
                )}
                Generate Today&apos;s News Podcast
              </Button>
            )}
          </div>

          {/* Generated Podcasts */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-400" />
              Generated Podcasts
            </h2>

            {podcasts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                No podcasts generated yet. Click generate to create your first news podcast!
              </div>
            ) : (
              <div className="space-y-4">
                {podcasts.map((podcast) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl glass-panel"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span className="font-medium">{podcast.date}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {podcast.language === 'hi-IN' ? 'Hindi' : 'English'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-400 mb-3">
                      {podcast.headlines.slice(0, 3).map((h, i) => (
                        <div key={i} className="truncate">• {h}</div>
                      ))}
                      {podcast.headlines.length > 3 && (
                        <div className="text-gray-500">+{podcast.headlines.length - 3} more</div>
                      )}
                    </div>

                    {podcast.audioUrl ? (
                      <AudioPlayer audioUrl={podcast.audioUrl} />
                    ) : (
                      <Button
                        onClick={async () => {
                          try {
                            const ttsRes = await fetch('/api/podcast/tts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ script: podcast.script, language: podcast.language })
                            })
                            const ttsData = await ttsRes.json()
                            if (ttsData.audio) {
                              const newAudio = `data:audio/mp3;base64,${ttsData.audio}`
                              setPodcasts(prev => prev.map(p => 
                                p.id === podcast.id ? { ...p, audioUrl: newAudio } : p
                              ))
                            }
                          } catch (e) {
                            toast.error("Failed to generate audio")
                          }
                        }}
                        size="sm"
                        className="w-full bg-white/5 hover:bg-white/10"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Generate Audio
                      </Button>
                    )}

                    <Link href={`/create/podcast?topic=${encodeURIComponent('Daily News: ' + podcast.date)}&script=${encodeURIComponent(JSON.stringify(podcast.script))}`}>
                      <Button variant="outline" size="sm" className="w-full mt-2 border-white/10">
                        <Save className="w-4 h-4 mr-2" />
                        Open in Studio
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
