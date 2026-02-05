import { createClient } from '@/lib/supabase'

export interface Project {
  id: string
  title: string
  type: 'podcast' | 'slides'
  content: any
  audio_url?: string
  created_at: string
}

export const saveProject = async (
  title: string, 
  type: 'podcast' | 'slides', 
  content: any, 
  audioUrl?: string | null
) => {
  const { data: { user } } = await createClient.auth.getUser()
  
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await createClient
    .from('projects')
    .insert([
      { 
        user_id: user.id,
        title: title || 'Untitled Project',
        type,
        content,
        audio_url: audioUrl
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getProjects = async () => {
  const { data: { user } } = await createClient.auth.getUser()
  if (!user) return []

  const { data, error } = await createClient
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}
