import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

const client = new TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { script, language = "en-US" } = await req.json();

    if (!script || !Array.isArray(script)) {
      return NextResponse.json({ error: "Invalid script format" }, { status: 400 });
    }

    // Sequential Generation Strategy (Reliable Fallback)
    // We generate audio for each line individually using the correct voice
    // and then concatenate the buffers.
    
    const audioBuffers: Buffer[] = [];
    
    // Voice Mapping
    const voiceMap = {
        'Host': { name: 'en-US-Neural2-D', languageCode: 'en-US' },
        'Guest': { name: 'en-GB-Neural2-A', languageCode: 'en-GB' },
        // Fallback for script speaker names
        'Speaker R': { name: 'en-US-Neural2-D', languageCode: 'en-US' },
        'Speaker S': { name: 'en-GB-Neural2-A', languageCode: 'en-GB' },
    };

    for (const line of script) {
        if (!line.line) continue;

        // Determine speaker
        const speakerKey = line.speaker === 'Speaker R' || line.speaker === 'Host' ? 'Host' : 'Guest';
        const voiceConfig = voiceMap[speakerKey];

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
                
                // Optional: Add 300ms silence between turns for natural pacing
                // (We can skip this for MVP to keep it fast)
            }
        } catch (e) {
            console.error(`Error generating line for ${speakerKey}:`, e);
        }
    }

    if (audioBuffers.length === 0) {
        throw new Error("No audio content generated");
    }

    // Concatenate all buffers
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
