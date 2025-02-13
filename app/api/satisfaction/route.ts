import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Load satisfaction score prompt from file
const SATISFACTION_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'prompts', 'satisfaction-score.txt'),
  'utf-8'
);

// Define schema for structured output
const SatisfactionSchema = z.object({
  reasoning: z.string().describe('Explanation for the satisfaction score'),
  score: z.number().min(1).max(5).describe('Satisfaction score from 1-5')
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    console.log('🤖 [Satisfaction] Starting analysis with transcript length:', transcript.length);
    console.log('📋 [Satisfaction] Using prompt:', SATISFACTION_PROMPT);

    const { object: result, response } = await generateObject({
      model: anthropic('claude-3-5-sonnet-latest'),
      schema: SatisfactionSchema,
      schemaName: 'SatisfactionScore',
      schemaDescription: 'Satisfaction score and reasoning based on chat transcript analysis',
      prompt: `${SATISFACTION_PROMPT}\n\nAnalyze this chat transcript and return reasoning and satisfaction score:\n\n${transcript}`,
      temperature: 0.5,
      maxTokens: 1024,
    });

    // Log the full response for debugging
    console.log('📬 [Satisfaction] Full Claude API response:', JSON.stringify(response, null, 2));
    console.log('✅ [Satisfaction] Parsed result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [Satisfaction] Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to generate satisfaction score' },
      { status: 500 }
    );
  }
}