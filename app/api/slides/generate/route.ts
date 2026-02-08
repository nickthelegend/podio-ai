import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const enhancedSlideSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    slides: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Slide title for reference" },
          speakerNotes: { type: SchemaType.STRING, description: "Detailed speaker notes (40-60 words)" },
          htmlContent: {
            type: SchemaType.STRING,
            description: "Complete HTML code for the slide with inline CSS styles. Must be a self-contained div with all styling inline. Use modern CSS like gradients, shadows, flexbox, grid, animations."
          },
          layoutType: {
            type: SchemaType.STRING,
            description: "Layout type: title, content, statistics, timeline, comparison, conclusion"
          },
          bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Key bullet points for TTS"
          },
          backgroundColor: { type: SchemaType.STRING, description: "Main background color hex" },
          textColor: { type: SchemaType.STRING, description: "Main text color hex" },
          accentColor: { type: SchemaType.STRING, description: "Accent color hex" },
        },
        required: ["title", "speakerNotes", "htmlContent", "layoutType", "bullets", "backgroundColor", "textColor", "accentColor"],
      },
    },
  },
  required: ["slides"],
};

const getStyleConfig = (style: string) => {
  const styles: Record<string, { colors: string; aesthetic: string; examples: string }> = {
    Modern: {
      colors: "Deep dark backgrounds (#0a0a0f, #12121a, #1a1a2e) with vibrant accents (#ec4899, #8b5cf6, #3b82f6). Light text (#ffffff).",
      aesthetic: "Clean, minimal, bold typography, subtle gradients, glassmorphism effects, animated gradients.",
      examples: `
        - Use backdrop-filter: blur() for glass effects
        - Subtle animated gradients with @keyframes
        - Floating orbs/shapes with glow effects
        - Card-based layouts with hover effects`
    },
    Dark: {
      colors: "Ultra-dark backgrounds (#030303, #0a0a0a, #111111) with neon accents (#00ff88, #00d4ff, #ff6b6b). Pure white text.",
      aesthetic: "Dramatic, high-contrast, cinematic, neon glow effects, cyberpunk vibes.",
      examples: `
        - Neon glow with box-shadow and text-shadow
        - Animated border gradients
        - Grid lines and scan line effects
        - Glitch-style text animations`
    },
    Corporate: {
      colors: "Professional backgrounds (#1e3a5f, #2d3748, #1a365d) with sophisticated accents (#38b2ac, #ed8936, #4299e1). Clean white text.",
      aesthetic: "Polished, trustworthy, executive, clean data visualizations.",
      examples: `
        - Clean grid layouts
        - Subtle gradients
        - Icon-based bullet points
        - Progress bars and metrics`
    },
    Creative: {
      colors: "Bold vibrant colors, gradients mixing purples (#7c3aed), pinks (#ec4899), oranges (#f97316).",
      aesthetic: "Playful, energetic, memorable, bold shapes, creative typography.",
      examples: `
        - Organic blob shapes
        - Multi-color gradients
        - Large bold numbers
        - Playful animations`
    },
    Minimal: {
      colors: "Clean white/off-white backgrounds (#ffffff, #fafafa), single accent color, dark text (#1a1a1a).",
      aesthetic: "Ultra-clean, whitespace-focused, typography-driven, subtle accents.",
      examples: `
        - Lots of whitespace
        - Elegant serif fonts
        - Thin accent lines
        - Subtle hover states`
    }
  };

  return styles[style] || styles.Modern;
};

export async function POST(req: Request) {
  try {
    const { topic, count = 5, style = "Modern" } = await req.json();
    const styleConfig = getStyleConfig(style);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: enhancedSlideSchema,
      },
    });

    const systemInstruction = `You are an elite presentation designer who creates STUNNING slide decks using HTML and CSS code.

## TASK
Create ${count} slides about: "${topic}"

## DESIGN STYLE: ${style}
${styleConfig.aesthetic}

## COLOR PALETTE
${styleConfig.colors}

## DESIGN TECHNIQUES
${styleConfig.examples}

## CRITICAL REQUIREMENTS FOR htmlContent

Each slide's htmlContent must be a COMPLETE, SELF-CONTAINED HTML div that looks absolutely stunning.

### HTML STRUCTURE
\`\`\`html
<div style="width: 100%; height: 100%; position: relative; overflow: hidden; [BACKGROUND_STYLES]">
  <!-- Decorative background elements -->
  <div style="position: absolute; ..."></div>
  
  <!-- Main content -->
  <div style="position: relative; z-index: 10; padding: 60px; height: 100%; display: flex; flex-direction: column; justify-content: center;">
    <!-- Your slide content here -->
  </div>
</div>
\`\`\`

### MUST INCLUDE:
1. **Stunning backgrounds**: Gradients, patterns, floating shapes, grid lines
2. **Decorative elements**: Glowing orbs, accent shapes, blur effects
3. **Beautiful typography**: Large headings, proper hierarchy, custom styling
4. **Visual elements**: Icons (use emoji), colored boxes, progress indicators
5. **All styles INLINE**: No external CSS, everything in style attributes

### LAYOUT TYPES TO USE:
1. **title** (Slide 1): Hero layout with large centered title, subtitle, decorative background
2. **content**: Key points with numbered cards, icons, visual hierarchy
3. **statistics**: Big numbers with labels, progress indicators, data cards
4. **timeline**: Steps/process with connecting lines, numbered circles
5. **comparison**: Two-column layout with vs divider, pros/cons cards
6. **conclusion** (Last slide): Call-to-action, key takeaways as pills, memorable closing

### EXAMPLE SLIDE htmlContent (Statistics layout):
\`\`\`html
<div style="width: 100%; height: 100%; position: relative; overflow: hidden; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);">
  <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%); border-radius: 50%;"></div>
  <div style="position: absolute; bottom: -50px; left: -50px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%); border-radius: 50%;"></div>
  <div style="position: relative; z-index: 10; padding: 60px; height: 100%; display: flex; flex-direction: column;">
    <h2 style="font-size: 42px; font-weight: 700; color: #ffffff; margin: 0 0 50px 0;">Key Metrics</h2>
    <div style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 40px;">
      <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 64px; font-weight: 800; background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">95%</div>
        <div style="font-size: 16px; color: rgba(255,255,255,0.7); margin-top: 8px;">Customer Satisfaction</div>
      </div>
      <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 64px; font-weight: 800; background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">2.5x</div>
        <div style="font-size: 16px; color: rgba(255,255,255,0.7); margin-top: 8px;">Revenue Growth</div>
      </div>
    </div>
  </div>
</div>
\`\`\`

### SLIDE FLOW
1. Slide 1 (title): Powerful opening with topic, use decorative backgrounds
2. Slides 2-${count - 1}: Mix of content, statistics, timeline layouts - vary for engagement
3. Slide ${count} (conclusion): Strong call-to-action, key takeaways

Create slides that would WOW an audience. Make designers jealous. Be creative with CSS effects!`;

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
