export interface Project {
  id: string
  title: string
  type: 'podcast' | 'slides'
  content: any
  audio_url?: string
  created_at: string
}

const STORAGE_KEY = 'podio-projects'

const getLocalProjects = (): Project[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

const setLocalProjects = (projects: Project[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const saveProject = async (
  title: string,
  type: 'podcast' | 'slides',
  content: any,
  audioUrl?: string | null,
  projectId?: string
) => {
  const fallbackId = projectId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}`)

  const projects = getLocalProjects()
  const existingIndex = projects.findIndex(p => p.id === fallbackId)

  const record: Project = {
    id: fallbackId,
    title: title || 'Untitled Project',
    type,
    content,
    audio_url: audioUrl || undefined,
    created_at: existingIndex >= 0 ? projects[existingIndex].created_at : new Date().toISOString()
  }

  if (existingIndex >= 0) {
    projects[existingIndex] = record
  } else {
    projects.unshift(record)
  }

  setLocalProjects(projects)
  return record
}

export const getProjects = async () => {
  return getLocalProjects()
}

export const getProjectById = async (projectId: string) => {
  const projects = getLocalProjects()
  return projects.find(p => p.id === projectId) || null
}

export const deleteProject = async (projectId: string) => {
  const projects = getLocalProjects().filter(p => p.id !== projectId)
  setLocalProjects(projects)
  return true
}
