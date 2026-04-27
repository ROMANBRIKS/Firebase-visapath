'use server';
/**
 * @fileOverview An AI Success Assistant that answers technical questions based on a purchased visa roadmap.
 * Grounded in the specific technical content of the guide.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const AISuccessAssistantInputSchema = z.object({
  roadmapContent: z.string().describe('The full technical content of the purchased roadmap.'),
  question: z.string().describe('The user\'s specific question.'),
  history: z.array(ChatMessageSchema).describe('Previous messages in the conversation.'),
});
export type AISuccessAssistantInput = z.infer<typeof AISuccessAssistantInputSchema>;

const AISuccessAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI\'s expert response.'),
});
export type AISuccessAssistantOutput = z.infer<typeof AISuccessAssistantOutputSchema>;

const assistantPrompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: { schema: AISuccessAssistantInputSchema },
  output: { schema: AISuccessAssistantOutputSchema },
  prompt: `You are the VisaPath Success Assistant, an elite consultant. 

Your task is to answer questions about a specific visa roadmap. You must be strictly grounded in the provided technical roadmap content and the 2024/2025 regulatory context.

TECHNICAL ROADMAP CONTENT:
{{{roadmapContent}}}

CONVERSATION HISTORY:
{{#each history}}
  {{role}}: {{{text}}}
{{/each}}

USER QUESTION:
{{{question}}}

INSTRUCTIONS:
1. **Be Specific**: Reference the exact phases, forms, or requirements mentioned in the roadmap.
2. **Strategy First**: Don't just repeat facts; provide strategic context (the "why" and "how").
3. **Tone**: Professional, encouraging, and highly authoritative.
4. **Constraints**: If the question is outside the scope of the roadmap or visa immigration, politely refocus the user on their relocation goals.
5. **No Hallucinations**: If the roadmap doesn't mention a specific fee or detail and you aren't 100% sure of the 2024/2025 rule, advise the user to check the "Consular Insights" section or contact official channels.

Provide the response in the requested JSON format.`,
});

const aiSuccessAssistantFlow = ai.defineFlow(
  {
    name: 'aiSuccessAssistantFlow',
    inputSchema: AISuccessAssistantInputSchema,
    outputSchema: AISuccessAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await assistantPrompt(input);
    return output!;
  }
);

export async function askSuccessAssistant(input: AISuccessAssistantInput): Promise<AISuccessAssistantOutput> {
  return aiSuccessAssistantFlow(input);
}
