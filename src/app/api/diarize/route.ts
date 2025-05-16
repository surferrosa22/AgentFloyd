import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Disable default body parsing to handle form-data
export const config = { api: { bodyParser: false } };

// Types for AssemblyAI transcript response
interface WordSegment {
  speaker_label: string;
  text: string;
}
interface TranscriptResponse {
  status: string;
  words?: WordSegment[];
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const assemblyToken = process.env.ASSEMBLYAI_API_TOKEN;
    if (!assemblyToken) {
      return NextResponse.json({ error: 'AssemblyAI API token not configured' }, { status: 500 });
    }

    // Read form-data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { authorization: assemblyToken },
      body: audioFile.stream(),
    });
    if (!uploadRes.ok) throw new Error('Failed to upload audio');
    const { upload_url } = await uploadRes.json();

    // Request transcription with speaker labels
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: assemblyToken,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ audio_url: upload_url, speaker_labels: true })
    });
    if (!transcriptRes.ok) throw new Error('Failed to request transcription');
    const { id } = await transcriptRes.json();

    // Poll for completion
    let transcript: TranscriptResponse;
    while (true) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: assemblyToken }
      });
      transcript = (await statusRes.json()) as TranscriptResponse;
      if (transcript.status === 'completed') break;
      if (transcript.status === 'error') {
        throw new Error(transcript.error || 'Transcription error');
      }
    }

    // Determine the primary speaker (largest word count)
    const counts: Record<string, number> = {};
    for (const w of transcript.words || [] as WordSegment[]) {
      counts[w.speaker_label] = (counts[w.speaker_label] || 0) + 1;
    }
    const primarySpeaker = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    // Collect text of primary speaker
    const userText = (transcript.words || [] as WordSegment[])
      .filter((w: WordSegment) => w.speaker_label === primarySpeaker)
      .map((w: WordSegment) => w.text)
      .join(' ');

    return NextResponse.json({ text: userText });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Diarization API error:', errMsg);
    return NextResponse.json({ error: errMsg || 'Unknown error' }, { status: 500 });
  }
} 