import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

// Initialize the client
const client = new TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { script, language = "en-US" } = await req.json();

    if (!script || !Array.isArray(script)) {
      return NextResponse.json({ error: "Invalid script format" }, { status: 400 });
    }

    // Voice Configuration
    // Map speakers to specific Google Cloud Voices
    const voices = {
      'Speaker R': { name: 'en-US-Studio-O', gender: 'FEMALE' },
      'Speaker S': { name: 'en-US-Studio-Q', gender: 'MALE' },
      // Fallback for Indian languages if selected
      'hi-IN-R': { name: 'hi-IN-Neural2-A', gender: 'FEMALE' },
      'hi-IN-S': { name: 'hi-IN-Neural2-B', gender: 'MALE' },
    };

    // Helper to pick voice based on language and speaker
    const getVoiceParams = (speaker: string, lang: string) => {
      if (lang === 'hi-IN') {
        return speaker === 'Speaker R' ? voices['hi-IN-R'] : voices['hi-IN-S'];
      }
      // Default English
      return speaker === 'Speaker R' ? voices['Speaker R'] : voices['Speaker S'];
    };

    // Generate audio for each line independently
    const audioBuffers: Buffer[] = [];

    // Process lines sequentially to maintain order (Promise.all might mix order if not careful with index)
    // We use a for-loop for simple sequential processing to ensure order.
    for (const line of script) {
        if (!line.line || line.line.trim() === '') continue;

        const voiceParams = getVoiceParams(line.speaker, language);

        const request = {
            input: { text: line.line },
            voice: { languageCode: language, name: voiceParams.name },
            audioConfig: { audioEncoding: "MP3" as const, speakingRate: 1.0 },
        };

        try {
            const [response] = await client.synthesizeSpeech(request);
            if (response.audioContent) {
                audioBuffers.push(Buffer.from(response.audioContent));
                
                // Optional: Add a small silence gap between speakers?
                // For MVP, we'll just concat. 
                // A better approach involves generating a silent buffer, but let's keep it simple.
            }
        } catch (e) {
            console.error(`Error synthesizing line for ${line.speaker}:`, e);
        }
    }

    if (audioBuffers.length === 0) {
        throw new Error("No audio content generated");
    }

    // Concatenate all audio buffers into one single MP3
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    return NextResponse.json({ 
      audio: finalAudioBuffer.toString("base64") 
    });

  } catch (error) {
    console.error("Multi-Speaker TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
