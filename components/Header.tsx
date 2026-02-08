'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Podio AI
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="/create/content" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <span className="bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-pink-500/20">New</span>
              Social Studio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:inline">{user.email}</span>
              <Button onClick={handleSignOut} variant="ghost" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10">
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="text-xs">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
