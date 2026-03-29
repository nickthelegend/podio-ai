import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

export interface Project {
  _id: string;
  userId: string;
  title: string;
  type: 'podcast' | 'slides';
  content: any;
  audioUrl?: string;
  createdAt: number;
}

export const saveProject = async (
  userId: string,
  title: string,
  type: 'podcast' | 'slides',
  content: any,
  audioUrl?: string | null,
  projectId?: string
) => {
  const response = await fetch(`${CONVEX_URL}/projects/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId,
      userId,
      title,
      type,
      content,
      audioUrl,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save project");
  }

  return response.json();
};

export const getProjects = async (userId: string) => {
  const response = await fetch(`${CONVEX_URL}/projects/list?userId=${userId}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
};

export const getProjectById = async (projectId: string) => {
  const response = await fetch(`${CONVEX_URL}/projects/get?projectId=${projectId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const deleteProject = async (projectId: string, userId: string) => {
  const response = await fetch(`${CONVEX_URL}/projects/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }

  return true;
};
