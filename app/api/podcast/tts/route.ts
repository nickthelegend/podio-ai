import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

const client = new TextToSpeechClient();

// Voice Configurations
const VOICE_REGISTRY: Record<string, { Host: any; Guest: any }> = {
  // English (US)
  "en-US": {
    Host: { name: "en-US-Neural2-D", languageCode: "en-US" }, // Male
    Guest: { name: "en-GB-Neural2-A", languageCode: "en-GB" }, // Female
  },
  // Hindi (India)
  "hi-IN": {
    Host: { name: "hi-IN-Neural2-B", languageCode: "hi-IN" }, // Male
    Guest: { name: "hi-IN-Neural2-A", languageCode: "hi-IN" }, // Female
  },
  // Tamil (India)
  "ta-IN": {
    Host: { name: "ta-IN-Neural2-B", languageCode: "ta-IN" }, // Male
    Guest: { name: "ta-IN-Neural2-A", languageCode: "ta-IN" }, // Female
  },
  // Telugu (India)
  "te-IN": {
    Host: { name: "te-IN-Standard-B", languageCode: "te-IN" }, // Male
    Guest: { name: "te-IN-Standard-A", languageCode: "te-IN" }, // Female
  },
};

export async function POST(req: Request) {
  try {
    const { script, language = "en-US" } = await req.json();

    if (!script || !Array.isArray(script)) {
      return NextResponse.json({ error: "Invalid script format" }, { status: 400 });
    }

    const audioBuffers: Buffer[] = [];
    
    // Select voice config based on language, fallback to en-US
    const selectedVoices = VOICE_REGISTRY[language] || VOICE_REGISTRY["en-US"];

    for (const line of script) {
        if (!line.line) continue;

        const speakerKey = line.speaker === 'Speaker R' || line.speaker === 'Host' ? 'Host' : 'Guest';
        const voiceConfig = selectedVoices[speakerKey as keyof typeof selectedVoices];

        const request = {
            input: { text: line.line },
            voice: { 
                languageCode: voiceConfig.languageCode, 
                name: voiceConfig.name 
            },
            audioConfig: { audioEncoding: "MP3" as const }
        };

        try {
            const [response] = await client.synthesizeSpeech(request);
            if (response.audioContent) {
                audioBuffers.push(Buffer.from(response.audioContent));
            }
        } catch (e) {
            console.error(`Error generating line for ${speakerKey} (${language}):`, e);
        }
    }

    if (audioBuffers.length === 0) {
        throw new Error("No audio content generated");
    }

    const finalAudio = Buffer.concat(audioBuffers);

    return NextResponse.json({ 
      audio: finalAudio.toString("base64") 
    });

  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate audio" },
      { status: 500 }
    );
  }
}
