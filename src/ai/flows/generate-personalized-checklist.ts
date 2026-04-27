
'use server';
/**
 * @fileOverview An AI flow that generates a personalized document checklist based on user profile and visa type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalizedChecklistInputSchema = z.object({
  visaType: z.string().describe('The type of visa being applied for.'),
  country: z.string().describe('The destination country.'),
  userProfile: z.object({
    nationality: z.string().describe('Current citizenship.'),
    education: z.string().describe('Highest degree obtained.'),
    experience: z.string().describe('Years of relevant work experience.'),
    currentSalary: z.string().optional().describe('Approximate current annual salary.'),
  }),
});
export type GeneratePersonalizedChecklistInput = z.infer<typeof GeneratePersonalizedChecklistInputSchema>;

const ChecklistItemSchema = z.object({
  category: z.string().describe('Category of the document (e.g., Financial, Professional, Identity).'),
  name: z.string().describe('The name of the document.'),
  description: z.string().describe('A brief explanation of why this document is needed and how to get it.'),
  status: z.enum(['Required', 'Conditional', 'Action Needed']).describe('Urgency or condition of the document.'),
});

const GeneratePersonalizedChecklistOutputSchema = z.object({
  title: z.string().describe('A title for the personalized checklist.'),
  summary: z.string().describe('A brief executive summary of the document requirements.'),
  items: z.array(ChecklistItemSchema).describe('The list of required documents.'),
});
export type GeneratePersonalizedChecklistOutput = z.infer<typeof GeneratePersonalizedChecklistOutputSchema>;

const checklistPrompt = ai.definePrompt({
  name: 'checklistPrompt',
  input: { schema: GeneratePersonalizedChecklistInputSchema },
  output: { schema: GeneratePersonalizedChecklistOutputSchema },
  prompt: `You are an expert immigration document auditor. 
Your task is to generate a personalized document checklist for a {{{visaType}}} to {{{country}}}.

USER PROFILE:
- Nationality: {{{userProfile.nationality}}}
- Education: {{{userProfile.education}}}
- Experience: {{{userProfile.experience}}}
- Current Salary: {{{userProfile.currentSalary}}}

INSTRUCTIONS:
1. Identify the core document requirements for this specific visa and country.
2. Personalize the requirements based on the user's education and experience (e.g., if it's a skilled worker visa, emphasize degree verification).
3. Categorize documents into logical groups: "Identity & Travel", "Professional & Academic", "Financial Evidence", and "Health & Character".
4. For each item, provide a "description" that includes a success tip (e.g., "Must be translated by a certified professional").
5. Be specific to 2024/2025 regulations.

Provide the response in the requested JSON format.`,
});

const generatePersonalizedChecklistFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedChecklistFlow',
    inputSchema: GeneratePersonalizedChecklistInputSchema,
    outputSchema: GeneratePersonalizedChecklistOutputSchema,
  },
  async (input) => {
    const { output } = await checklistPrompt(input);
    return output!;
  }
);

export async function generatePersonalizedChecklist(input: GeneratePersonalizedChecklistInput): Promise<GeneratePersonalizedChecklistOutput> {
  return generatePersonalizedChecklistFlow(input);
}
