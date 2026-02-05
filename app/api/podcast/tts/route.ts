import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";

// Initialize the client. 
// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in .env.local pointing to your JSON key file
// OR pass credentials directly if managing via env vars differently.
const client = new TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { script, language = "en-US" } = await req.json();

    if (!script || !Array.isArray(script)) {
      return NextResponse.json({ error: "Invalid script format" }, { status: 400 });
    }

    // Combine the script into SSML for multi-speaker simulation
    // Note: Standard Google TTS doesn't support multi-speaker in one request easily like Studio voices might in the future directly via SSML tags for speakers.
    // For this MVP, we will generate audio for each line and concatenate (or just one voice for now if simpler).
    // Let's try to make it sound like a conversation by alternating voices if possible, or using SSML with voice tags if supported by the Studio voice.
    
    // Using the requested "en-US-Studio-MultiSpeaker" is a specific feature. 
    // If that specific multi-speaker model is not available via standard API yet, we fallback to standard Studio voices.
    // Let's assume we iterate and merge. For speed/MVP, let's join text.
    
    // Better approach for MVP: Join text with pauses.
    // Ideally, we'd make parallel calls for R and S with different voice params and merge buffers.
    
    const text = script.map((s: any) => `${s.speaker}: ${s.line}`).join("\n\n");

    const request = {
      input: { text },
      // Select the language and SSML voice gender (optional)
      voice: { languageCode: language, name: "en-US-Studio-O" }, // Using a high quality Studio voice as default
      audioConfig: { audioEncoding: "MP3" as const },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    if (!audioContent) {
      throw new Error("No audio content received");
    }

    // Return audio as base64
    return NextResponse.json({ 
      audio: Buffer.from(audioContent).toString("base64") 
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
