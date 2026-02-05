import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Mic, Presentation, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creator Studio</h1>
            <p className="text-gray-400">Manage your projects and create new magic.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-purple-400">
              Credits: 250
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Link href="/create/podcast" className="group">
            <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 to-black border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <Mic className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Generate Podcast</h2>
              <p className="text-gray-400">Transform text into a multi-speaker audio experience.</p>
            </div>
          </Link>

          <Link href="/create/slides" className="group">
            <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-pink-900/20 to-black border border-white/10 hover:border-pink-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 p-2 rounded-full bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <Presentation className="w-12 h-12 text-pink-400 mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Generate Slides</h2>
              <p className="text-gray-400">Create professional presentation decks from a prompt.</p>
            </div>
          </Link>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" /> Recent Projects
          </h3>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i % 2 === 0 ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {i % 2 === 0 ? <Presentation className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium">Project Alpha {i}</h4>
                    <p className="text-xs text-gray-500">Generated 2 hours ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
