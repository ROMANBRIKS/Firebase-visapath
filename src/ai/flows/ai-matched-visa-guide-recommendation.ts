'use server';
/**
 * @fileOverview An AI agent that recommends suitable visa acquisition guides based on user input.
 *
 * - aiMatchedVisaGuideRecommendation - A function that handles the visa guide recommendation process.
 * - AIMatchedVisaGuideRecommendationInput - The input type for the aiMatchedVisaGuideRecommendation function.
 * - AIMatchedVisaGuideRecommendationOutput - The return type for the aiMatchedVisaGuideRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMatchedVisaGuideRecommendationInputSchema = z.object({
  originCountry: z.string().describe('The user\'s current country of residence or citizenship.'),
  destinationCountry: z.string().describe('The user\'s intended destination country.'),
  travelIntent: z.string().describe('The purpose of the user\'s travel (e.g., tourism, work, study, family visit, business).'),
});
export type AIMatchedVisaGuideRecommendationInput = z.infer<typeof AIMatchedVisaGuideRecommendationInputSchema>;

const AIMatchedVisaGuideRecommendationOutputSchema = z.object({
  recommendedGuides: z.array(
    z.object({
      title: z.string().describe('The title of the recommended visa guide.'),
      visaType: z.string().describe('The type of visa the guide pertains to (e.g., Schengen C Visa, Work Permit, Student Visa).'),
      reasonForRecommendation: z.string().describe('A brief explanation of why this guide is suitable for the user\'s specific needs, based on origin, destination, and travel intent.'),
    })
  ).describe('A list of recommended visa acquisition guides.'),
});
export type AIMatchedVisaGuideRecommendationOutput = z.infer<typeof AIMatchedVisaGuideRecommendationOutputSchema>;

const recommendVisaGuidePrompt = ai.definePrompt({
  name: 'recommendVisaGuidePrompt',
  input: {schema: AIMatchedVisaGuideRecommendationInputSchema},
  output: {schema: AIMatchedVisaGuideRecommendationOutputSchema},
  prompt: `You are an expert visa consultant specializing in international travel regulations. Your task is to recommend the most suitable visa acquisition guides based on a user's specific travel details.

Based on the following information, identify and recommend visa guides that are highly relevant to the user's needs. For each recommendation, provide a clear title for the guide, the specific visa type it covers, and a concise reason explaining why it's a good match.

Consider all factors like potential visa waivers, required visa categories, and common pathways for the given origin, destination, and intent. If multiple guides are relevant, recommend up to three. If no specific guide seems to perfectly match, provide a general guidance and suggest exploring common visa types for the destination.

User Details:
- Origin Country: {{{originCountry}}}
- Destination Country: {{{destinationCountry}}}
- Travel Intent: {{{travelIntent}}}

Provide your recommendations in a JSON array format, strictly following the output schema.
`,
});

const aiMatchedVisaGuideRecommendationFlow = ai.defineFlow(
  {
    name: 'aiMatchedVisaGuideRecommendationFlow',
    inputSchema: AIMatchedVisaGuideRecommendationInputSchema,
    outputSchema: AIMatchedVisaGuideRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await recommendVisaGuidePrompt(input);
    return output!;
  }
);

export async function aiMatchedVisaGuideRecommendation(input: AIMatchedVisaGuideRecommendationInput): Promise<AIMatchedVisaGuideRecommendationOutput> {
  return aiMatchedVisaGuideRecommendationFlow(input);
}
