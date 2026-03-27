import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (would be replaced with Convex in production)
const podcasts: {
  id: string;
  date: string;
  headlines: string[];
  script: { speaker: string; line: string }[];
  audioUrl?: string;
  language: string;
  createdAt: number;
}[] = [];

export async function GET() {
  return NextResponse.json({ podcasts });
}

export async function POST(req: Request) {
  try {
    const { headlines, script, audioUrl, language, date } = await req.json();

    const podcast = {
      id: uuidv4(),
      date: date || new Date().toISOString().split('T')[0],
      headlines,
      script,
      audioUrl,
      language: language || 'en-US',
      createdAt: Date.now()
    };

    podcasts.unshift(podcast);

    return NextResponse.json({ podcast, success: true });
  } catch (error) {
    console.error("Save podcast error:", error);
    return NextResponse.json({ error: "Failed to save podcast" }, { status: 500 });
  }
}
