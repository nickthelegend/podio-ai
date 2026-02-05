import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Podio AI
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
              Docs
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="text-xs">Dashboard</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
