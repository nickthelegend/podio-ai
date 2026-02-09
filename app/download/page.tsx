'use client'

import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Download, Chrome, Puzzle, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
      <Header />
      
      <main className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-4"
            >
              <Puzzle className="w-3 h-3" /> 
              Chrome Extension v1.0.1
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-500"
            >
              Podio AI on the Go
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Turn any webpage, article, or blog post into a podcast dialogue instantly. The Podio AI extension lives in your sidepanel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="pt-8"
            >
              <a href="/podio-extension.zip" download>
                <Button size="lg" className="h-16 px-10 text-lg bg-white text-black hover:bg-gray-200 rounded-2xl shadow-2xl shadow-white/5 group">
                  <Download className="mr-3 w-6 h-6 group-hover:translate-y-0.5 transition-transform" /> 
                  Download Extension (.zip)
                </Button>
              </a>
              <p className="mt-4 text-xs text-gray-500 font-mono tracking-widest uppercase">~240 KB • Safe & Private</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 bg-white/5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Chrome className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold">Easy Install</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Extract the ZIP, go to <span className="text-purple-300">chrome://extensions</span>, enable Developer Mode, and click "Load Unpacked".</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 bg-white/5">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold">Sidepanel Access</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Pin the extension and access Podio AI without leaving your current tab. It's always one click away.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-white/5 bg-white/5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold">Privacy First</h3>
              <p className="text-sm text-gray-400 leading-relaxed">The extension only reads the text on the active tab when you click "Generate". No data is ever sold.</p>
            </div>
          </div>
          
          <div className="mt-24 p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/20 to-transparent flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Back to the Studio?</h2>
              <p className="text-gray-400">Head back to manage your projects and generate slide decks.</p>
            </div>
            <a href="/dashboard">
              <Button variant="outline" className="h-12 px-8 border-white/20 hover:bg-white/5">
                Open Studio <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
