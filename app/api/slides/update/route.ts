import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const singleSlideSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        title: {
            type: SchemaType.STRING,
            description: "Compelling title for the slide"
        },
        layoutType: {
            type: SchemaType.STRING,
            description: "Layout type: 'title', 'statistics', 'content', 'conclusion', 'quote', 'timeline', 'image', 'comparison'"
        },
        bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3-5 key points"
        },
        speakerNotes: {
            type: SchemaType.STRING,
            description: "Detailed talking points for the presenter, 50-80 words"
        },
        subtitle: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING }
    },
    required: ["title", "layoutType", "bullets", "speakerNotes"],
};

export async function POST(req: Request) {
    try {
        const { topic, instruction, currentSlide, style = "Modern" } = await req.json();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: singleSlideSchema,
                temperature: 0.8,
            },
        });

        const prompt = `You are an expert presentation editor. Your task is to update a SPECIFIC slide based on user instructions.

## CONTEXT
**Presentation Topic:** "${topic}"
**Current Style:** ${style}

## CURRENT SLIDE DATA
${JSON.stringify(currentSlide, null, 2)}

## USER INSTRUCTION FOR THIS SLIDE
"${instruction}"

## REQUIREMENTS
1. Update the slide content (title, bullets, speaker notes) following the instruction.
2. Maintain the overall tone and topic of the presentation.
3. If the instruction asks for specific changes, prioritize them.
4. If the instruction is vague, improve the clarity and impact of the slide.
5. Speaker notes should be detailed (50-80 words) and act as a script for this slide.
6. Return only the updated slide fields. Avoid changing colors or gradients unless explicitly asked.

## OUTPUT FORMAT
Return a JSON object matching the requested schema.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const json = JSON.parse(response.text());

        // Merge with current slide to preserve colors/gradients
        const updatedSlide = {
            ...currentSlide,
            ...json
        };

        return NextResponse.json({ slide: updatedSlide });
    } catch (error) {
        console.error("Gemini Slide Update Error:", error);
        return NextResponse.json(
            { error: "Failed to update slide" },
            { status: 500 }
        );
    }
}
