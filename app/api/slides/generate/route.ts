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
          title: {
            type: SchemaType.STRING,
            description: "Compelling, attention-grabbing title for the slide"
          },
          layoutType: {
            type: SchemaType.STRING,
            description: "Layout type: 'title' for opening, 'statistics' for numbers/data, 'content' for bullet points, 'conclusion' for closing"
          },
          bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3-5 key points. For statistics layout, use format 'VALUE: Description' (e.g., '85%: Companies using AI')"
          },
          speakerNotes: {
            type: SchemaType.STRING,
            description: "Detailed talking points for the presenter, 50-80 words, conversational tone"
          },
          backgroundColor: {
            type: SchemaType.STRING,
            description: "Primary background color in hex format (e.g., #0a0a0f)"
          },
          textColor: {
            type: SchemaType.STRING,
            description: "Text color in hex format (e.g., #ffffff)"
          },
          accentColor: {
            type: SchemaType.STRING,
            description: "Accent color for highlights and decorations in hex format (e.g., #ec4899)"
          },
          gradient: {
            type: SchemaType.STRING,
            description: "CSS gradient for background (e.g., 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)')"
          },
          subtitle: {
            type: SchemaType.STRING,
            description: "Optional subtitle or tagline for title slides"
          },
          description: {
            type: SchemaType.STRING,
            description: "Optional longer description text"
          }
        },
        required: ["title", "layoutType", "bullets", "speakerNotes", "backgroundColor", "textColor", "accentColor"],
      },
    },
  },
  required: ["slides"],
};

const stylePresets: Record<string, { colors: string; vibe: string }> = {
  Modern: {
    colors: "Dark backgrounds (#0a0a0f, #1a1a2e), pink accent (#ec4899), purple secondary (#8b5cf6), white text",
    vibe: "Sleek, tech-forward, gradient-rich, glassmorphism effects"
  },
  Dark: {
    colors: "Pure black (#000000, #0a0a0a), neon green accent (#00ff88), cyan secondary (#00d4ff), white text",
    vibe: "Cyberpunk, high-contrast, neon glows, futuristic"
  },
  Corporate: {
    colors: "Navy backgrounds (#1e3a5f, #2d3748), teal accent (#38b2ac), orange secondary (#ed8936), white text",
    vibe: "Professional, trustworthy, clean lines, subtle gradients"
  },
  Creative: {
    colors: "Vibrant purples (#4c1d95, #7c3aed), orange accent (#f97316), pink secondary (#ec4899), white text",
    vibe: "Bold, artistic, playful, dynamic gradients, energetic"
  },
  Minimal: {
    colors: "Light backgrounds (#ffffff, #f5f5f5), black accent (#000000), gray secondary (#6b7280), dark text (#111111)",
    vibe: "Clean, spacious, typography-focused, subtle shadows"
  }
};

export async function POST(req: Request) {
  try {
    const { topic, count = 5, style = "Modern" } = await req.json();
    const preset = stylePresets[style] || stylePresets.Modern;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
        temperature: 0.85,
      },
    });

    const prompt = `You are a world-class presentation designer and content strategist creating STUNNING, IMPACTFUL slides.

## TOPIC: "${topic}"
## STYLE: ${style}
## SLIDES TO CREATE: ${count}

## STYLE GUIDE
**Colors:** ${preset.colors}
**Vibe:** ${preset.vibe}

## CONTENT REQUIREMENTS

### MAKE IT IMPRESSIVE
- Include REAL statistics with credible sources (Forbes, McKinsey, Gartner, etc.)
- Use specific numbers that impress (revenue figures, growth rates, user counts)
- Add industry insights and compelling facts
- Write like a TED speaker - clear, punchy, memorable
- Use power words: Revolutionary, Unprecedented, Game-changing, Transformative

### SLIDE STRUCTURE

**Slide 1 - Title (layoutType: "title")**
- Create a powerful, memorable title (max 8 words)
- Add an inspiring subtitle
- Set the stage for the entire presentation
- Use the most striking gradient from the color palette

**Slides 2-${count - 1} - Mix of Content & Statistics**
- Alternate between "content" and "statistics" layouts
- For STATISTICS slides: Use bullets like "85%: Companies adopting AI by 2025 - Gartner"
- For CONTENT slides: Use action-oriented bullet points
- Include 3-5 bullets per slide
- Each bullet should be quotable and memorable

**Slide ${count} - Conclusion (layoutType: "conclusion")**
- Bold statement or call-to-action
- Key takeaways as short, punchy phrases
- End with impact - leave them wanting more

### SPEAKER NOTES
Write 50-80 words per slide:
- Conversational, engaging tone
- Key talking points and transitions
- Stats to emphasize verbally
- Questions to ask the audience

### COLOR GUIDELINES
- Use the style's color palette consistently
- backgroundColor: Primary slide background (dark shade)
- textColor: Main text color (usually white for dark themes)
- accentColor: For highlights, numbers, decorations (vibrant color)
- gradient: Beautiful CSS gradient combining background colors

## EXAMPLE OUTPUTS

For a statistics slide:
{
  "title": "The AI Revolution in Numbers",
  "layoutType": "statistics",
  "bullets": [
    "85%: Enterprise AI adoption by 2025 - Gartner",
    "$15.7T: Global AI economic impact - PwC",
    "40%: Productivity boost from AI tools - McKinsey",
    "10x: Faster decision making with AI analytics"
  ],
  "speakerNotes": "These numbers tell a compelling story. The 85% adoption rate means if you're not implementing AI now, you're falling behind. And look at that economic impact - 15.7 trillion dollars. That's not a typo. This is the biggest technological shift since the internet.",
  "backgroundColor": "#0a0a0f",
  "textColor": "#ffffff",
  "accentColor": "#ec4899",
  "gradient": "linear-gradient(135deg, #0a0a0f 0%, #1a0a20 100%)"
}

For a content slide:
{
  "title": "Key Implementation Strategies",
  "layoutType": "content",
  "bullets": [
    "Start with high-impact, low-risk pilot projects",
    "Build cross-functional AI literacy programs",
    "Establish clear governance and ethical guidelines",
    "Create feedback loops for continuous improvement"
  ],
  "speakerNotes": "Implementation is where theory meets reality. Start small but think big. The pilot project approach lets you prove value quickly while building organizational confidence. Remember, AI transformation is a marathon, not a sprint.",
  "backgroundColor": "#0f0f1a",
  "textColor": "#ffffff",
  "accentColor": "#8b5cf6",
  "gradient": "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)"
}

NOW CREATE ${count} ABSOLUTELY STUNNING SLIDES ABOUT "${topic}"!`;

    const result = await model.generateContent(prompt);
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
