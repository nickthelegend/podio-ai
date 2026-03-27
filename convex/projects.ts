import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveProject = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    userId: v.string(),
    title: v.string(),
    type: v.union(v.literal("podcast"), v.literal("slides")),
    content: v.any(),
    audioUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, userId, title, type, content, audioUrl } = args;

    if (projectId) {
      const existing = await ctx.db.get(projectId);
      if (existing && existing.userId === userId) {
        await ctx.db.patch(projectId, {
          title,
          content,
          audioUrl,
        });
        return await ctx.db.get(projectId);
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

    return await ctx.db.get(id);
  },
});

export const getProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { projectId, userId } = args;
    const project = await ctx.db.get(projectId);
    
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    await ctx.db.delete(projectId);
    return true;
  },
});
