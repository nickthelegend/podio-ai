
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
    const { topic, language = "en-US" } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const systemInstruction = `You are a professional podcast writer targeting an Indian audience. 
    Your task is to generate a short, engaging podcast-style dialogue (approx 2-3 minutes) between two speakers, Speaker R and Speaker S.
    The topic is: "${topic}".
    The language should be: "${language}". 
    If the language is an Indian language (like Hindi, Tamil, etc.), use simple, conversational language mixed with English terms where appropriate (Hinglish/Tanglish style is acceptable if natural).
    Make it sound natural, with back-and-forth interaction.`;

    const result = await model.generateContent(systemInstruction);
    const response = result.response;
    const json = JSON.parse(response.text());

    return NextResponse.json(json);
  } catch (error) {
    console.error("Gemini Script Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
