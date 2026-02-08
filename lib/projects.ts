import { supabase } from '@/lib/supabase'

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
  audioUrl?: string | null,
  projectId?: string
) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  // Check if project already exists (for updates)
  if (projectId) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (existing) {
      // Update existing project
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: title || 'Untitled Project',
          content,
          audio_url: audioUrl,
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  // Create new project with custom ID if provided
  const insertData: any = {
    user_id: user.id,
    title: title || 'Untitled Project',
    type,
    content,
    audio_url: audioUrl
  }

  // If projectId is provided, use it
  if (projectId) {
    insertData.id = projectId
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([insertData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getProjects = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export const getProjectById = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) return null
  return data as Project
}

export const deleteProject = async (projectId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
  return true
}
