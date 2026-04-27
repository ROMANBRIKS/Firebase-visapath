
'use server';
/**
 * @fileOverview An AI flow that researches recent regulatory changes for a specific visa.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePolicyUpdatesInputSchema = z.object({
  country: z.string().describe('The destination country.'),
  visaType: z.string().describe('The specific type of visa.'),
});
export type GeneratePolicyUpdatesInput = z.infer<typeof GeneratePolicyUpdatesInputSchema>;

const PolicyUpdateSchema = z.object({
  title: z.string().describe('Headline of the change.'),
  date: z.string().describe('Effective date of the change.'),
  description: z.string().describe('What changed exactly.'),
  impactLevel: z.enum(['Low', 'Medium', 'High']).describe('How much this affects typical applicants.'),
  actionRequired: z.string().describe('What the applicant should do now.'),
});

const GeneratePolicyUpdatesOutputSchema = z.object({
  lastResearched: z.string().describe('The timestamp of the research.'),
  updates: z.array(PolicyUpdateSchema).describe('List of recent regulatory changes.'),
  expertSummary: z.string().describe('A brief strategic summary of the current landscape.'),
});
export type GeneratePolicyUpdatesOutput = z.infer<typeof GeneratePolicyUpdatesOutputSchema>;

const updatePrompt = ai.definePrompt({
  name: 'updatePrompt',
  input: { schema: GeneratePolicyUpdatesInputSchema },
  output: { schema: GeneratePolicyUpdatesOutputSchema },
  prompt: `You are an elite Immigration Policy Analyst. 
Your task is to research and report the most recent 2024/2025 regulatory changes for the {{{visaType}}} in {{{country}}}.

INSTRUCTIONS:
1. Identify changes in:
   - Salary thresholds or financial requirements.
   - Application fees or surcharges.
   - Quotas/Lottery caps.
   - Required forms or procedural steps.
   - Post-arrival registration requirements.
2. For each update, explain the "Action Required" for someone currently applying.
3. Be specific to 2024/2025 data.
4. If no major changes occurred in the last 6 months, report on upcoming scheduled changes for late 2025.

Provide a detailed report in the requested JSON format.`,
});

const generatePolicyUpdatesFlow = ai.defineFlow(
  {
    name: 'generatePolicyUpdatesFlow',
    inputSchema: GeneratePolicyUpdatesInputSchema,
    outputSchema: GeneratePolicyUpdatesOutputSchema,
  },
  async (input) => {
    const { output } = await updatePrompt(input);
    return output!;
  }
);

export async function generatePolicyUpdates(input: GeneratePolicyUpdatesInput): Promise<GeneratePolicyUpdatesOutput> {
  return generatePolicyUpdatesFlow(input);
}
