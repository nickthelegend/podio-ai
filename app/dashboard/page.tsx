'use client'

import { useEffect, useState, useCallback } from 'react'
import { getProjects, Project } from '@/lib/projects'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Mic, Presentation, Clock, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (e) {
      toast.error("Failed to load projects.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        fetchProjects()
      }
    }
    checkUser()
  }, [router, fetchProjects])

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      <Header />

      <main className="container mx-auto px-6 pt-32 pb-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">Creator Studio</h1>
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
            <div className="h-full p-8 rounded-3xl glass-panel hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-4 right-4 p-2 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <Mic className="w-12 h-12 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Generate Podcast</h2>
              <p className="text-gray-400">Transform text into a multi-speaker audio experience.</p>
            </div>
          </Link>

          <Link href="/create/slides" className="group">
            <div className="h-full p-8 rounded-3xl glass-panel hover:border-pink-500/50 transition-all duration-300 relative overflow-hidden">
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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-xl glass-panel hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.type === 'slides' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {project.type === 'slides' ? <Presentation className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{project.title}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {new Date(project.created_at).toLocaleDateString()} • {project.type === 'slides' ? 'Presentation' : 'Audio Script'}
                        </p>
                        {project.audio_url && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[8px] font-bold uppercase tracking-wider border border-green-500/20">
                            Audio Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/project/${project.id}`)
                        toast.success("Share link copied!")
                      }}
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-white"
                    >
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      Edit
                    </Button>
                    {project.audio_url && (
                      <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
              No projects yet. Start creating!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
