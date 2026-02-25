import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, platform, style, sessionId } = await req.json();

    // Get the latest user message to store
    const lastUserMessage = messages[messages.length - 1];

    // No auth or persistence (supabase disabled)

    // Define system instructions based on platform and style
    let systemPrompt = `You are a social media expert creating high-impact content for ${platform}.
  Your style is: ${style}.
  
  Style Guidelines:
  - GenZ: Use slang (fr, ong, cap/no cap), lowercase, emojis, chaotic energy.
  - Degen: Crypto/Web3 slang (wagmi, ngmi, lfg), maximize hype, minimal punctuation.
  - Corporate: Professional, buzzwords (synergy, leverage, robust), polite, structured.
  - Stylish: Elegant, minimalist, aesthetic, thoughtful, curated vocabulary.
  - Formal: Academic, precise, no contractions, sophisticated sentence structure.
  - Natural: Conversational, authentic, relatable, balanced.
  
  Platform Guidelines:
  - Twitter/X: Short (under 280 chars), threads if needed, heavy hashtag use if appropriate.
  - LinkedIn: Professional yet engaging, longer form, line breaks for readability.
  
  Return ONLY the content of the post(s). No "Here is your post" preamble.`;

    const result = streamText({
        model: google('gemini-1.5-pro'),
        messages,
        system: systemPrompt,
        onFinish: async ({ text }) => {
            // Store assistant response
            // No persistence
        },
    });

    return result.toTextStreamResponse();
}
