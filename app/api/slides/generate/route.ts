
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const slideSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    slides: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          bullets: { 
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          speakerNotes: { type: SchemaType.STRING },
          backgroundColor: { type: SchemaType.STRING, description: "Hex code for background" },
          textColor: { type: SchemaType.STRING, description: "Hex code for text" },
        },
        required: ["title", "bullets", "speakerNotes", "backgroundColor", "textColor"],
      },
    },
  },
  required: ["slides"],
};

export async function POST(req: Request) {
  try {
    const { topic, count = 5, style = "Modern" } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
      },
    });

    const systemInstruction = `You are a professional presentation designer.
    Create a ${count}-slide presentation on the topic: "${topic}".
    The style should be "${style}".
    
    For each slide:
    1. Provide a catchy Title.
    2. Provide 3-5 punchy Bullet points.
    3. Write engaging Speaker Notes that explain the slide (approx 30-40 words).
    4. Suggest a Background Color and Text Color that matches the "${style}" aesthetic (e.g., Dark mode uses deep blues/blacks, Corporate uses clean whites/grays).
    
    Ensure the content flows logically from introduction to conclusion.`;

    const result = await model.generateContent(systemInstruction);
    const response = result.response;
    const json = JSON.parse(response.text());

    return NextResponse.json(json);
  } catch (error) {
    console.error("Gemini Slide Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    );
  }
}
