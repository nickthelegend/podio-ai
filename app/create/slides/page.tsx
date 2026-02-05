import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Presentation, Wand2 } from 'lucide-react'

export default function CreateSlidesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-16 max-w-3xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-pink-400 mb-2">
            <Presentation className="w-4 h-4" /> 
            <span className="text-sm font-medium uppercase tracking-wider">Presentation Engine</span>
          </div>
          <h1 className="text-4xl font-bold">New Slide Deck</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Presentation Topic</label>
            <input 
              type="text"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g. The Future of AI in Healthcare"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Key Points (Optional)</label>
            <textarea 
              className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              placeholder="List specific points you want covered..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Style</label>
              <select className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>Modern & Clean</option>
                <option>Dark & Bold</option>
                <option>Corporate</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Slide Count</label>
              <select className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>5 Slides</option>
                <option>10 Slides</option>
                <option>15 Slides</option>
              </select>
            </div>
          </div>

          <Button size="lg" className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-base font-bold">
            <Wand2 className="mr-2 w-5 h-5" /> Generate Deck (15 Credits)
          </Button>
        </div>
      </main>
    </div>
  )
}
