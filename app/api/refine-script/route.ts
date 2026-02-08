import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
    const { text, style } = await req.json();

    if (!text) return new Response('Text is required', { status: 400 });

    const systemPrompt = `You are a professional script editor. Rewrite the following text to match the requested style: "${style}".
  
  Styles:
  - Professional: Clear, concise, business-appropriate.
  - Funny/Witty: Add humor, clever wordplay, engaging.
  - Concise: Shorten to key points only.
  - Engaging: Use rhetorical questions, better hook, more dynamic phrasing.
  - Academic: Formal, structured, scholarly tone.
  
  Return ONLY the rewritten text. Do not add conversational filler.`;

    const { text: refinedText } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: text,
        system: systemPrompt,
    });

    return Response.json({ refinedText });
}
