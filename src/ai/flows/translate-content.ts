'use server';
/**
 * @fileOverview An AI flow that translates visa guide content into a target language.
 * Professional-grade translation that preserves Markdown and technical terminology.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateContentInputSchema = z.object({
  text: z.string().describe('The content to translate.'),
  targetLanguage: z.string().describe('The language to translate into.'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  translatedText: z.string().describe('The translated version of the input text.'),
});
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: { schema: TranslateContentInputSchema },
  output: { schema: TranslateContentOutputSchema },
  prompt: `You are an expert professional translator specializing in international relocation and legal immigration terminology.

Translate the following content into {{{targetLanguage}}}. 

CONTENT:
{{{text}}}

INSTRUCTIONS:
1. **Tone**: Maintain the professional, expert, and authoritative tone of the original.
2. **Technical Accuracy**: Ensure that technical terms (like "LCA", "Form I-129", "Anmeldung", "EU Blue Card") are translated with their culturally and legally correct equivalents, or kept in parentheses if the original term is standard.
3. **Format**: Preserve all Markdown formatting exactly (headers #, ##, bullet points *, bold text **).
4. **Completeness**: Provide a full, accurate translation. Do not summarize.

Provide the response in the requested JSON format.`,
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async (input) => {
    const { output } = await translationPrompt(input);
    return output!;
  }
);

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}
