import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveNewsPodcast = mutation({
  args: {
    date: v.string(),
    headlines: v.array(v.string()),
    script: v.any(),
    audioUrl: v.optional(v.string()),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const { date, headlines, script, audioUrl, language } = args;

    // Check if already exists for this date
    const existing = await ctx.db
      .query("newsPodcasts")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        headlines,
        script,
        audioUrl,
        language,
      });
      return await ctx.db.get(existing._id);
    }

    // Create new
    const id = await ctx.db.insert("newsPodcasts", {
      date,
      headlines,
      script,
      audioUrl,
      language,
      createdAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const getNewsPodcasts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("newsPodcasts")
      .withIndex("by_date")
      .order("desc")
      .take(30);
  },
});

export const getNewsPodcastByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const { date } = args;
    return await ctx.db
      .query("newsPodcasts")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
  },
});
