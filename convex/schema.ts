import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),
    type: v.union(v.literal("podcast"), v.literal("slides")),
    title: v.string(),
    content: v.any(),
    audioUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["userId, createdAt"]),
});
