'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Github } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-gray-400">Authentication is disabled. No login required.</p>
          </div>

          <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
            <Button
              disabled
              className="w-full bg-[#24292e] hover:bg-[#2f363d] h-12 gap-2 text-base font-medium"
            >
              <Github className="w-5 h-5" />
              GitHub login disabled
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0c0c0c] px-2 text-gray-500">Or</span>
              </div>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value=""
                  onChange={() => {}}
                  placeholder="creator@podio.ai"
                  disabled
                  className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled
                className="w-full bg-purple-600 hover:bg-purple-700 h-10"
              >
                Continue with Email (disabled)
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
