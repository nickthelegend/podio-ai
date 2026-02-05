import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { ArrowRight, Mic, Presentation } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Header />
      
      <main className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              v1.0 Now Live
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              Turn Ideas into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Multimedia Magic
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Generate studio-quality podcasts and professional slide decks in seconds using advanced AI. No microphone or design skills required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-gray-200">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 hover:bg-white/5">
                View Examples
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-purple-500/50 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Mic className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">AI Podcast Generator</h3>
              <p className="text-gray-400 mb-6">Convert text, articles, or notes into engaging audio conversations with lifelike voices.</p>
              <div className="flex items-center text-sm font-medium text-purple-400">
                Create Podcast <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-pink-500/50 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Presentation className="w-12 h-12 text-pink-400 mb-6" />
              <h3 className="text-2xl font-bold mb-2">Smart Slides</h3>
              <p className="text-gray-400 mb-6">Generate beautiful, formatted presentation decks from a simple topic or outline.</p>
              <div className="flex items-center text-sm font-medium text-pink-400">
                Generate Slides <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
