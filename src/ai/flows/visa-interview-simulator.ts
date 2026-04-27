'use server';
/**
 * @fileOverview An AI Consular Officer that conducts mock visa interviews.
 * Provides a score and feedback at the end of the session.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewMessageSchema = z.object({
  role: z.enum(['officer', 'applicant']),
  text: z.string(),
});

const InterviewSimulatorInputSchema = z.object({
  visaType: z.string().describe('The type of visa being applied for.'),
  destination: z.string().describe('The destination country.'),
  history: z.array(InterviewMessageSchema).describe('The conversation history.'),
});
export type InterviewSimulatorInput = z.infer<typeof InterviewSimulatorInputSchema>;

const InterviewSimulatorOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('The next question from the officer.'),
  feedback: z.string().optional().describe('General feedback on performance (only if ended).'),
  successScore: z.number().min(0).max(100).optional().describe('Success probability score (0-100).'),
  isEnded: z.boolean().describe('Whether the interview has concluded.'),
});
export type InterviewSimulatorOutput = z.infer<typeof InterviewSimulatorOutputSchema>;

const simulatorPrompt = ai.definePrompt({
  name: 'simulatorPrompt',
  input: { schema: InterviewSimulatorInputSchema },
  output: { schema: InterviewSimulatorOutputSchema },
  prompt: `You are a professional, strict, but fair Consular Officer at the {{{destination}}} Embassy. 
Your goal is to conduct a realistic 3-question mock interview for a {{{visaType}}} visa.

CURRENT STATE:
- Destination: {{{destination}}}
- Visa Type: {{{visaType}}}
- History: 
{{#each history}}
  {{role}}: {{{text}}}
{{/each}}

INSTRUCTIONS:
1. If the history is empty, start by asking a standard opening question (e.g., "Why do you want to visit {{{destination}}}?").
2. If there are fewer than 3 questions asked by the officer so far, ask the next relevant follow-up question based on the applicant's previous answer.
3. If 3 questions have been asked and answered, set isEnded to true. 
4. When isEnded is true:
   - Provide a "successScore" (0-100) based on how convincing, consistent, and confident the applicant's answers were.
   - Provide a "feedback" summary explaining what they did well and what they should improve (e.g., "Be more specific about your ties to your home country").
5. Keep your tone professional and slightly formal.

Provide the response in the requested JSON format.`,
});

const interviewSimulatorFlow = ai.defineFlow(
  {
    name: 'interviewSimulatorFlow',
    inputSchema: InterviewSimulatorInputSchema,
    outputSchema: InterviewSimulatorOutputSchema,
  },
  async (input) => {
    const { output } = await simulatorPrompt(input);
    return output!;
  }
);

export async function simulateInterview(input: InterviewSimulatorInput): Promise<InterviewSimulatorOutput> {
  return interviewSimulatorFlow(input);
}
