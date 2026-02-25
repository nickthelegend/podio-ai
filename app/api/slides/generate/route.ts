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
          title: { type: SchemaType.STRING },
          speakerNotes: { type: SchemaType.STRING },
          htmlContent: { type: SchemaType.STRING },
          layoutType: { type: SchemaType.STRING },
          bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          backgroundColor: { type: SchemaType.STRING },
          textColor: { type: SchemaType.STRING },
          accentColor: { type: SchemaType.STRING },
        },
        required: ["title", "speakerNotes", "htmlContent", "layoutType", "bullets", "backgroundColor", "textColor", "accentColor"],
      },
    },
  },
  required: ["slides"],
};

export async function POST(req: Request) {
  try {
    const { topic, count = 5, style = "Modern" } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: enhancedSlideSchema,
        temperature: 0.9,
      },
    });

    const prompt = `You are a WORLD-CLASS presentation designer creating BREATHTAKING slides. Your slides make audiences gasp. Your designs win awards.

## YOUR MISSION
Create ${count} STUNNING slides about: "${topic}"
Style: ${style}

## CRITICAL: CONTENT REQUIREMENTS

### RESEARCH & DATA
For EVERY slide, include:
- **Real statistics** with sources (e.g., "85% of Fortune 500 companies..." - Forbes 2024)
- **Specific numbers** that impress (revenue figures, growth percentages, user counts)
- **Industry insights** that sound authoritative
- **Compelling facts** that make people want to learn more

### CONTENT QUALITY
- Write like a TED speaker - clear, punchy, memorable
- Use power words: "Revolutionary", "Unprecedented", "Game-changing"
- Include metaphors and analogies
- Every bullet should be quotable

## CRITICAL: VISUAL DESIGN REQUIREMENTS

### HTML STRUCTURE
Each slide's htmlContent must be a complete, self-contained HTML div:

\`\`\`html
<div style="width:100%;height:100%;position:relative;overflow:hidden;background:[GRADIENT];font-family:'Segoe UI',system-ui,sans-serif;">
  <!-- LAYER 1: Background Effects -->
  <!-- LAYER 2: Decorative Shapes -->  
  <!-- LAYER 3: Main Content -->
</div>
\`\`\`

### DESIGN ELEMENTS TO USE

**BACKGROUNDS (pick creative combinations):**
- Mesh gradients: \`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\`
- Radial glows: \`background: radial-gradient(ellipse at top right, rgba(236,72,153,0.4) 0%, transparent 50%);\`
- Layered gradients: Multiple positioned gradients

**DECORATIVE SHAPES:**
- Glowing orbs: \`position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.3) 0%,transparent 70%);filter:blur(40px);\`
- Grid patterns: \`background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:50px 50px;\`
- Floating lines: Diagonal accent lines with gradients
- Geometric shapes: Rotated squares, hexagons with border only

**TYPOGRAPHY:**
- Huge numbers: \`font-size:120px;font-weight:900;background:linear-gradient(135deg,#fff,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;\`
- Gradient text for emphasis
- Letter-spacing for headings: \`letter-spacing:-0.02em;\`
- Text shadows for depth: \`text-shadow:0 4px 30px rgba(0,0,0,0.3);\`

**CARDS & CONTAINERS:**
- Glass cards: \`background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;\`
- Accent borders: \`border-left:4px solid #ec4899;\`
- Subtle shadows: \`box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);\`

**ICONS (use emoji creatively):**
📊 💡 🚀 ⚡ 🎯 💎 🔥 ✨ 📈 🏆 💰 🌟 🔮 💫 ⭐

## SLIDE LAYOUTS

### SLIDE 1: TITLE (Hero Opening)
- Massive centered title with gradient text
- Animated-looking decorative orbs in corners
- Subtle tagline below
- Eye-catching accent shapes

Example:
\`\`\`html
<div style="width:100%;height:100%;position:relative;overflow:hidden;background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#0a0a14 100%);font-family:'Segoe UI',system-ui,sans-serif;">
  <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(236,72,153,0.15) 0%,transparent 70%);border-radius:50%;"></div>
  <div style="position:absolute;bottom:-150px;left:-150px;width:600px;height:600px;background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%);border-radius:50%;"></div>
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:60px 60px;"></div>
  <div style="position:relative;z-index:10;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px;">
    <div style="font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;color:#ec4899;margin-bottom:24px;padding:8px 20px;background:rgba(236,72,153,0.1);border:1px solid rgba(236,72,153,0.2);border-radius:100px;">✨ Presentation</div>
    <h1 style="font-size:72px;font-weight:800;line-height:1.1;margin:0;background:linear-gradient(135deg,#ffffff 0%,#ec4899 50%,#8b5cf6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:none;">The Future of AI</h1>
    <p style="font-size:24px;color:rgba(255,255,255,0.6);margin-top:24px;max-width:600px;">Transforming industries with intelligent automation</p>
  </div>
</div>
\`\`\`

### SLIDE 2-${count - 1}: CONTENT SLIDES
Mix these layouts creatively:

**STATISTICS LAYOUT:**
- 2-3 huge numbers in glass cards
- Each with gradient coloring
- Supporting context text

**KEY POINTS LAYOUT:**
- Numbered cards (01, 02, 03) with accent borders
- Icon + title + description format
- Staggered or grid arrangement

**COMPARISON LAYOUT:**
- Left vs Right with "VS" divider
- Contrasting colors for each side

**TIMELINE/PROCESS:**
- Horizontal or vertical flow
- Connected with lines or arrows
- Numbered steps

### SLIDE ${count}: CONCLUSION (Call to Action)
- Bold statement or question
- Key takeaways as pill badges
- Memorable closing line

## COLOR PALETTES BY STYLE

**Modern (Default):**
- Background: #0a0a0f → #1a1a2e
- Accent: #ec4899 (pink), #8b5cf6 (purple)
- Text: #ffffff, rgba(255,255,255,0.7)

**Dark:**
- Background: #000000 → #0a0a0a
- Accent: #00ff88 (neon green), #00d4ff (cyan)
- Text: #ffffff

**Corporate:**
- Background: #1e3a5f → #2d3748
- Accent: #38b2ac (teal), #ed8936 (orange)
- Text: #ffffff

**Creative:**
- Background: Vibrant gradients
- Accent: #f97316, #ec4899, #8b5cf6
- Text: varies

**Minimal:**
- Background: #ffffff → #f5f5f5
- Accent: #000000, #1a1a1a
- Text: #111111

## SPEAKER NOTES
Write 50-80 words per slide:
- Conversational tone
- Key talking points
- Transition phrases
- Statistics to emphasize verbally

## FINAL CHECKLIST
✓ Every slide has WOW factor
✓ Real data and statistics included
✓ Professional, authoritative content
✓ Stunning visual effects
✓ Consistent color theme
✓ Clear visual hierarchy
✓ Mobile-friendly (percentage-based sizing)

NOW CREATE ${count} ABSOLUTELY STUNNING SLIDES!`;

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
