import { httpRouter } from "./_generated/server";
import { httpAction } from "./_generated/server";
import { v } from "convex/values";

export const saveProject = httpAction(async (ctx, request) => {
  const { projectId, userId, title, type, content, audioUrl } = await request.json();

  if (projectId) {
    const existing = await ctx.db.get(projectId as any);
    if (existing && existing.userId === userId) {
      await ctx.db.patch(projectId, {
        title,
        content,
        audioUrl,
      });
      return Response.json(await ctx.db.get(projectId as any));
    }
  }

  const id = await ctx.db.insert("projects", {
    userId,
    title: title || "Untitled Project",
    type,
    content,
    audioUrl,
    createdAt: Date.now(),
  });

  return Response.json(await ctx.db.get(id));
});

export const getProjects = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json([]);
  }

  const projects = await ctx.db
    .query("projects")
    .withIndex("by_user")
    .filter((q) => q.eq(q.field("userId"), userId))
    .collect();

  return Response.json(projects);
});

export const getProjectById = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return Response.json(null);
  }

  const project = await ctx.db.get(projectId as any);
  return Response.json(project);
});

export const deleteProject = httpAction(async (ctx, request) => {
  const { projectId, userId } = await request.json();

  const project = await ctx.db.get(projectId as any);

  if (!project || project.userId !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  await ctx.db.delete(projectId as any);
  return Response.json({ success: true });
});

const http = httpRouter();

http.route({
  path: "/projects/save",
  method: "POST",
  handler: saveProject,
});

http.route({
  path: "/projects/list",
  method: "GET",
  handler: getProjects,
});

http.route({
  path: "/projects/get",
  method: "GET",
  handler: getProjectById,
});

http.route({
  path: "/projects/delete",
  method: "POST",
  handler: deleteProject,
});

export default http;
