import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// --- Projects Routes ---

http.route({
  path: "/projects/save",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/projects/save",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    const result = await ctx.runMutation(api.projects.saveProject, args);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/projects/list",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/projects/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return new Response(JSON.stringify([]), { headers: CORS_HEADERS });

    const result = await ctx.runQuery(api.projects.getProjects, { userId });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/projects/get",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/projects/get",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify(null), { headers: CORS_HEADERS });

    const result = await ctx.runQuery(api.projects.getProjectById, { projectId: projectId as any });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/projects/delete",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/projects/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    await ctx.runMutation(api.projects.deleteProject, args);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

// --- News Routes ---

http.route({
  path: "/news/save",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/news/save",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    const result = await ctx.runMutation(api.news.saveNewsPodcast, args);
    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/news/list",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    return new Response(null, { headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/news/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const result = await ctx.runQuery(api.news.getNewsPodcasts, {});
    return new Response(JSON.stringify(result), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }),
});

export default http;
