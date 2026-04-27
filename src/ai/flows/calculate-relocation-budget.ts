'use server';
/**
 * @fileOverview An AI flow that calculates a comprehensive relocation budget.
 * Researches 2024/2025 specific costs for visas, health surcharges, and cost of living.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateRelocationBudgetInputSchema = z.object({
  country: z.string().describe('The destination country.'),
  visaType: z.string().describe('The type of visa being applied for.'),
  familySize: z.number().min(1).max(10).describe('Number of people relocating (including the applicant).'),
});
export type CalculateRelocationBudgetInput = z.infer<typeof CalculateRelocationBudgetInputSchema>;

const CostItemSchema = z.object({
  category: z.string().describe('Category of the cost (e.g., Government Fees, Health, Housing).'),
  name: z.string().describe('Name of the specific cost item.'),
  amount: z.number().describe('The estimated amount in the destination currency.'),
  description: z.string().describe('Context for this cost.'),
});

const CalculateRelocationBudgetOutputSchema = z.object({
  currency: z.string().describe('The currency code (e.g., USD, GBP, EUR).'),
  officialFees: z.array(CostItemSchema).describe('Mandatory government and processing fees.'),
  survivalFund: z.array(CostItemSchema).describe('Required proof of funds or initial survival capital.'),
  housingCosts: z.array(CostItemSchema).describe('Initial housing costs (rent + deposit).'),
  totalEstimatedCapital: z.number().describe('The total estimated capital needed for the first 3 months.'),
  expertNote: z.string().describe('Strategic advice on managing these costs.'),
});
export type CalculateRelocationBudgetOutput = z.infer<typeof CalculateRelocationBudgetOutputSchema>;

const budgetPrompt = ai.definePrompt({
  name: 'budgetPrompt',
  input: { schema: CalculateRelocationBudgetInputSchema },
  output: { schema: CalculateRelocationBudgetOutputSchema },
  prompt: `You are an expert relocation financial advisor. 
Your task is to calculate a realistic "Arrival Capital" budget for a {{{visaType}}} to {{{country}}} for {{{familySize}}} person(s).

INSTRUCTIONS:
1. Research 2024/2025 specific mandatory costs:
   - Visa application fees (per person).
   - Mandatory health surcharges (e.g., UK IHS, German health insurance requirements).
   - Biometrics and secondary fees.
2. Estimate survival costs (Proof of Funds):
   - Use official government "maintenance" requirements if they exist.
   - If not, estimate 3 months of basic living expenses.
3. Estimate Housing:
   - Calculate average 1st month rent + security deposit in a major professional hub of that country.
4. Scale all costs based on a family size of {{{familySize}}}.
5. Use the local currency of {{{country}}}.

Provide a highly detailed breakdown in the requested JSON format.`,
});

const calculateRelocationBudgetFlow = ai.defineFlow(
  {
    name: 'calculateRelocationBudgetFlow',
    inputSchema: CalculateRelocationBudgetInputSchema,
    outputSchema: CalculateRelocationBudgetOutputSchema,
  },
  async (input) => {
    const { output } = await budgetPrompt(input);
    return output!;
  }
);

export async function calculateRelocationBudget(input: CalculateRelocationBudgetInput): Promise<CalculateRelocationBudgetOutput> {
  return calculateRelocationBudgetFlow(input);
}
