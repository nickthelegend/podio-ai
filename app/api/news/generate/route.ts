import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const schema = {
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
};

export async function POST(req: Request) {
  try {
    const { headlines, language = "en-US" } = await req.json();

    if (!headlines || !Array.isArray(headlines)) {
      return NextResponse.json({ error: "Invalid headlines" }, { status: 400 });
    }

    const headlinesText = headlines.map((h: string, i: number) => `${i + 1}. ${h}`).join("\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const langName = language === "hi-IN" ? "Hindi (India)" : "English";
    const isHindi = language === "hi-IN";

    const prompt = `You are a professional news podcast host. Create an engaging, conversational news podcast script covering today's top headlines.

HEADLINES:
${headlinesText}

Requirements:
- Language: ${langName}
- If Hindi, use Devanagari script (हिंदी में)
- Two speakers: Host (Speaker R) and Guest (Speaker S)
- Format: Natural conversational dialogue, not just reading headlines
- Length: Cover all headlines in an engaging 3-5 minute discussion
- Each speaker should add context, insights, and make it interesting for listeners
- Make it sound like a professional news podcast
- Include brief commentary on each headline before moving to the next
- Keep the conversation flowing naturally`;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());

    return NextResponse.json({
      script: json.dialogue || json,
      headlines,
      language
    });

  } catch (error) {
    console.error("News podcast generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate news podcast" },
      { status: 500 }
    );
  }
}
