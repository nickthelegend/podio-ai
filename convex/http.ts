import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Helper to add CORS headers
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  };
}

function withCors(request: Request, response: Response) {
  const headers = corsHeaders(request.headers.get("Origin"));
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// --- Projects Routes ---

http.route({
  path: "/projects/save",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/projects/save",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    const result = await ctx.runMutation(api.projects.saveProject, args);
    return withCors(request, new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

http.route({
  path: "/projects/list",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/projects/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return withCors(request, new Response(JSON.stringify([])));

    const result = await ctx.runQuery(api.projects.getProjects, { userId });
    return withCors(request, new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

http.route({
  path: "/projects/get",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/projects/get",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return withCors(request, new Response(JSON.stringify(null)));

    const result = await ctx.runQuery(api.projects.getProjectById, { projectId: projectId as any });
    return withCors(request, new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

http.route({
  path: "/projects/delete",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/projects/delete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    await ctx.runMutation(api.projects.deleteProject, args);
    return withCors(request, new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

// --- News Routes ---

http.route({
  path: "/news/save",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/news/save",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const args = await request.json();
    const result = await ctx.runMutation(api.news.saveNewsPodcast, args);
    return withCors(request, new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

http.route({
  path: "/news/list",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => new Response(null, { headers: corsHeaders(request.headers.get("Origin")) })),
});

http.route({
  path: "/news/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const result = await ctx.runQuery(api.news.getNewsPodcasts, {});
    return withCors(request, new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    }));
  }),
});

export default http;
