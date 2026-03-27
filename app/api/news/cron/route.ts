import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generativeAI";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// This endpoint can be called by a cron job (Vercel Cron, EasyCron, etc.)
// Schedule: Daily at 7 AM IST (or configure as needed)
// URL: /api/news/cron?key=YOUR_SECRET_KEY

const CRON_SECRET = process.env.CRON_SECRET || "podio-daily-news-cron";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // Verify cron key
    if (key !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch news
    const newsRes = await fetch(
      "https://economictimes.indiatimes.com/newslist.cms?catcode=104&catname=India",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const html = await newsRes.text();
    const headlines: string[] = [];

    // Extract headlines using patterns
    const patterns = [
      /data-script-title="([^"]+)"/gi,
      /data-article-title="([^"]+)"/gi,
      /"headline"\s*:\s*"([^"]+)"/gi,
    ];

    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const title = match[1]?.trim();
        if (title && title.length > 10 && title.length < 200) {
          headlines.push(title);
        }
      }
    }

    // Remove duplicates
    const uniqueHeadlines = [...new Set(headlines)].slice(0, 15);

    if (uniqueHeadlines.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No headlines found",
      });
    }

    // Generate podcast script
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            dialogue: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  speaker: { type: SchemaType.STRING },
                  line: { type: SchemaType.STRING },
                },
                required: ["speaker", "line"],
              },
            },
          },
          required: ["dialogue"],
        },
      },
    });

    const headlinesText = uniqueHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n");

    const prompt = `Create a professional news podcast script for today's top Indian business news headlines:

${headlinesText}

Format: Two speakers (Host and Guest) having an engaging discussion.
Language: English
Cover all headlines briefly but meaningfully.
Keep it conversational and professional.`;

    const result = await model.generateContent(prompt);
    const scriptData = JSON.parse(result.response.text());

    // Generate TTS
    const ttsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/podcast/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        script: scriptData.dialogue, 
        language: 'en-US' 
      })
    });

    const ttsData = await ttsRes.json();

    // Save to Convex (would be done here in production)
    // For now just return success

    const today = new Date().toISOString().split('T')[0];

    return NextResponse.json({
      success: true,
      date: today,
      headlinesCount: uniqueHeadlines.length,
      scriptGenerated: true,
      audioGenerated: !!ttsData.audio,
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
