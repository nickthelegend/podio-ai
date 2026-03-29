import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const proxyPath = url.pathname.replace("/api/proxy", ""); // e.g. /projects/save
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site");
    
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex URL not configured" }, { status: 500 });
    }

    // Ensure path starts with a slash
    const finalPath = proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;
    const targetUrl = `${convexUrl.replace(/\/$/, "")}${finalPath}`;

    const body = await req.json();
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      console.error(`Proxy received non-JSON for POST ${targetUrl}:`, text);
      return NextResponse.json({ error: "Upstream error", details: text }, { status: 502 });
    }
  } catch (error: any) {
    console.error("Proxy POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const proxyPath = url.pathname.replace("/api/proxy", ""); // e.g. /projects/list
    const search = url.search;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".cloud", ".site");
    
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex URL not configured" }, { status: 500 });
    }

    // Ensure path starts with a slash
    const finalPath = proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;
    const targetUrl = `${convexUrl.replace(/\/$/, "")}${finalPath}${search}`;

    const response = await fetch(targetUrl, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      console.error(`Proxy received non-JSON for GET ${targetUrl}:`, text);
      return NextResponse.json({ error: "Upstream error", details: text }, { status: 502 });
    }
  } catch (error: any) {
    console.error("Proxy GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
