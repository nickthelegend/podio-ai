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
            description: "3-5 key points. Be detailed if the user asks for it."
        },
        speakerNotes: {
            type: SchemaType.STRING,
            description: "Detailed talking points for the presenter, 60-100 words. ACTUALLY write what the presenter should say."
        },
        subtitle: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        backgroundColor: { type: SchemaType.STRING, description: "Hex color code" },
        textColor: { type: SchemaType.STRING, description: "Hex color code" },
        accentColor: { type: SchemaType.STRING, description: "Hex color code" },
        gradient: { type: SchemaType.STRING, description: "CSS gradient string" }
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
                temperature: 0.9, // Increased for better responsiveness to instructions
            },
        });

        const prompt = `You are an expert presentation editor. Your task is to update a SPECIFIC slide based on user instructions. 
        
The user wants to modify this slide. You MUST be extremely responsive to their instruction.

## CONTEXT
**Presentation Topic:** "${topic}"
**Current Style:** ${style}

## CURRENT SLIDE DATA (USE THIS AS STARTING POINT)
${JSON.stringify(currentSlide, null, 2)}

## USER INSTRUCTION (EXECUTE THIS)
"${instruction}"

## RE-EDITING GUIDELINES
1. **FOLLOW INSTRUCTIONS STRICTLY**: If the user asks for "more detail", double the amount of content in bullets and speaker notes. If they ask for a "rewrite", do not stick to the original text.
2. **MANDATORY CHANGE**: If the user provides an instruction, do NOT return identical content. Your output MUST show clear evidence of following the instruction.
3. **DETAIL & DEPTH**: When asked for "detailed" content, use industry-specific terminology, add data points, and expand on the "why" and "how".
4. **LAYOUT CHANGE**: If the instruction implies a different format (e.g., "show statistics", "make it a quote", "as a timeline"), change the layoutType accordingly.
5. **TONE**: Adapt the language to match requested tone (e.g., "make it funny", "more professional", "dramatic", "concise").
6. **STYLE**: If the user asks to change colors, background, or appearance, provide new hex codes/gradients. 
7. **SPEAKER NOTES**: These must be High Quality. Write exactly what should be said.

Return ONLY the updated fields in the requested JSON format.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const json = JSON.parse(response.text());

        // Merge with current slide
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
