'use server';
/**
 * @fileOverview A flow that researches and generates a two-layer visa guide.
 * Layer 1 (Public): Value Pitch (Benefits only).
 * Layer 2 (Purchased): The Roadmap (Detailed expert "PDF" content with strategic advice).
 * 
 * Each generation also archives a copy to docs/guides/ for inspection.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs';
import * as path from 'path';

const GenerateVisaGuideInputSchema = z.object({
  country: z.string().describe('The destination country for the visa guide.'),
  visaType: z.string().describe('The specific type of visa (e.g., Tourist, Digital Nomad, Skilled Worker).'),
});
export type GenerateVisaGuideInput = z.infer<typeof GenerateVisaGuideInputSchema>;

const VisaGuideOutputSchema = z.object({
  title: z.string().describe('A professional, results-oriented title.'),
  shortDescription: z.string().describe('A punchy 1-sentence value proposition.'),
  fullContent: z.string().describe('The PUBLIC PITCH. Focus ONLY on why this visa is life-changing. Benefits, lifestyle, career. NO technical data.'),
  purchasedRoadmap: z.string().describe('The ACTUAL PRODUCT (PDF Content). High-detail expert roadmap. Include strategic advice, success tips, common pitfalls, and detailed phase-by-phase guidance.'),
  price: z.number().describe('A recommended price between $49 and $99.'),
  category: z.enum(['Tourism', 'Work', 'Study', 'Nomad', 'Business']).describe('The primary category.'),
  prerequisites: z.array(z.string()).describe('High-level teaser categories (e.g., "Economic Stability").'),
  tableOfContents: z.array(z.string()).describe('A 5-step strategic outline for the roadmap.'),
  imageUrl: z.string().url().describe('A valid, percent-encoded URL.'),
  countryIds: z.array(z.string()).describe('Lowercase country name and common aliases.'),
});
export type VisaGuideOutput = z.infer<typeof VisaGuideOutputSchema>;

const generateGuidePrompt = ai.definePrompt({
  name: 'generateGuidePrompt',
  input: { schema: GenerateVisaGuideInputSchema },
  output: { schema: VisaGuideOutputSchema },
  prompt: `You are an elite international career and relocation consultant. 

Your task is to generate a premium two-layer resource for a {{{visaType}}} visa to {{{country}}}.

LAYER 1: THE PUBLIC PITCH (fullContent)
- Style: Professional, persuasive, benefit-driven.
- Template: "The {{{visaType}}} represents a pivotal opportunity... Designed for individuals... This comprehensive guide synthesizes the latest 2024/2025 regulations, offering an expert-level explanation of the 'why' and 'how' to successfully navigate this competitive visa category."
- Constraint: ABSOLUTELY NO technical data. No salary numbers, no form names, no processing times. Focus ONLY on the lifestyle, career, and family benefits.

LAYER 2: THE FULL ROADMAP (purchasedRoadmap)
- Style: Expert-level, authoritative, strategic, and deeply informative.
- Content: This is the premium product. For each of the 5 phases, DO NOT just list forms.
- Required Elements for EACH Phase:
    1. **Strategic Overview**: Explain the 'why' behind the phase.
    2. **Detailed Steps**: Actionable instructions on what to do.
    3. **Success Tips**: High-value advice to ensure approval (e.g., how to handle the interview, how to structure your CV).
    4. **Common Pitfalls**: What causes rejections and how to avoid them.
    5. **Consular Insights**: Technical 2024/2025 policy details (form IDs, salary thresholds, exact fees).
- Layout: Use professional Markdown headers and strategic bullet points. 

IMAGE: Use https://picsum.photos/seed/{{country}}-{{visaType}}/800/600`,
});

export async function generateVisaGuide(input: GenerateVisaGuideInput): Promise<VisaGuideOutput> {
  try {
    const { output } = await generateGuidePrompt(input);
    if (!output) throw new Error('Failed to generate guide');

    // Archive a copy to the backend folder for inspection
    try {
      const fileName = `${input.country.toLowerCase().replace(/\s+/g, '-')}-${input.visaType.toLowerCase().replace(/\s+/g, '-')}.md`;
      const dirPath = path.join(process.cwd(), 'docs', 'guides');
      const filePath = path.join(dirPath, fileName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const archiveContent = `# ${output.title}\n\n## Destination: ${input.country}\n## Visa Type: ${input.visaType}\n\n---\n\n### [PUBLIC PITCH]\n${output.fullContent}\n\n---\n\n### [TECHNICAL ROADMAP (PDF CONTENT)]\n${output.purchasedRoadmap}`;
      
      fs.writeFileSync(filePath, archiveContent);
    } catch (fsError) {
      console.warn('Failed to archive guide to filesystem:', fsError);
    }

    return output;
  } catch (error: any) {
    const isQuotaError = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
    if (isQuotaError) {
      console.warn("AI Quota reached in flow, retrying in 30s...");
      await new Promise(resolve => setTimeout(resolve, 30000));
      return generateVisaGuide(input);
    }
    throw error;
  }
}
