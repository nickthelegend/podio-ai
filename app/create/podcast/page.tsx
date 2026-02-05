import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Mic, Wand2 } from 'lucide-react'

export default function CreatePodcastPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-purple-400 mb-2">
            <Mic className="w-4 h-4" /> 
            <span className="text-sm font-medium uppercase tracking-wider">Audio Engine</span>
          </div>
          <h1 className="text-4xl font-bold">New Podcast</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Topic or Source Text</label>
            <textarea 
              className="w-full h-48 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Paste an article, blog post, or describe a topic..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Host Voice</label>
              <select className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Emma (Friendly)</option>
                <option>James (Professional)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Guest Voice</label>
              <select className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Marcus (Deep)</option>
                <option>Sarah (Energetic)</option>
              </select>
            </div>
          </div>

          <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base font-bold">
            <Wand2 className="mr-2 w-5 h-5" /> Generate Podcast (10 Credits)
          </Button>
        </div>
      </main>
    </div>
  )
}
