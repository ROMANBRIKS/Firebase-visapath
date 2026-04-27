'use server';
/**
 * @fileOverview A high-performance flow that converts visa guide summaries into audio.
 * Uses gemini-2.5-flash-preview-tts for natural narration.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const GenerateAudioGuideInputSchema = z.object({
  text: z.string().describe('The content to narrate.'),
});
export type GenerateAudioGuideInput = z.infer<typeof GenerateAudioGuideInputSchema>;

const GenerateAudioGuideOutputSchema = z.object({
  audioUri: z.string().describe('Data URI of the generated WAV audio.'),
});
export type GenerateAudioGuideOutput = z.infer<typeof GenerateAudioGuideOutputSchema>;

/**
 * Define a prompt for TTS for better reproducibility and structure.
 */
const ttsPrompt = ai.definePrompt({
  name: 'ttsPrompt',
  model: 'googleai/gemini-2.5-flash-preview-tts',
  input: { schema: GenerateAudioGuideInputSchema },
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Algenib' },
      },
    },
  },
  prompt: `Narrate a professional 30-second summary of this visa guide. Focus on the most important requirements.
  
  Content: {{{text}}}`,
});

/**
 * Optimized audio generation flow with retry logic for transient server errors.
 */
const generateAudioGuideFlow = ai.defineFlow(
  {
    name: 'generateAudioGuideFlow',
    inputSchema: GenerateAudioGuideInputSchema,
    outputSchema: GenerateAudioGuideOutputSchema,
  },
  async (input) => {
    let response;
    try {
      // First attempt with a condensed text length to minimize payload issues
      response = await ttsPrompt({ text: input.text.substring(0, 1000) });
    } catch (e: any) {
      // If we hit a 500 or transient error, retry once after a short delay
      const isTransient = e.message?.includes('500') || e.message?.includes('INTERNAL');
      if (isTransient) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = await ttsPrompt({ text: input.text.substring(0, 800) });
      } else {
        throw e;
      }
    }

    const { media } = response;

    if (!media || !media.url) {
      throw new Error('TTS generation failed: No media returned');
    }

    const base64Data = media.url.split(',')[1];
    if (!base64Data) {
      throw new Error('TTS generation failed: Invalid media data');
    }
    
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Convert PCM to WAV for broad browser support
    const wavData = await toWav(audioBuffer);

    return {
      audioUri: 'data:audio/wav;base64,' + wavData,
    };
  }
);

export async function generateAudioGuide(input: GenerateAudioGuideInput): Promise<GenerateAudioGuideOutput> {
  return generateAudioGuideFlow(input);
}

/**
 * Converts raw PCM audio buffer to a WAV formatted base64 string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      const bufs: Buffer[] = [];
      writer.on('error', reject);
      writer.on('data', (d) => bufs.push(d));
      writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

      writer.write(pcmData);
      writer.end();
    } catch (err) {
      reject(err);
    }
  });
}
