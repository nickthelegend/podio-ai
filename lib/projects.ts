export interface Project {
    id: string;
    title: string;
    type: 'slides' | 'podcast';
    created_at: string;
    content: any;
}

export async function getProjects(): Promise<Project[]> {
    return [];
}

export async function getProjectById(id: string): Promise<Project | null> {
    return null;
}

export async function saveProject(projectData: any) {
    return null;
}
