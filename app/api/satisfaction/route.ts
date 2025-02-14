import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Check for required API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required')
}

const CLAUDE_MODEL = anthropic('claude-3-5-haiku-latest')

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
  const perfStartTime = performance.now()

  try {
    // Cache the request body
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { transcript } = body

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 [API:Satisfaction] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Analyzing transcript of length ${transcript.length} chars`);

    const llmStartTime = performance.now()
    const { object: result } = await generateObject({
      model: CLAUDE_MODEL,
      schema: SatisfactionSchema,
      schemaName: 'SatisfactionScore',
      schemaDescription: 'Satisfaction score and reasoning based on chat transcript analysis',
      prompt: SATISFACTION_PROMPT.replace('{transcript}', transcript),
      temperature: 0.5,
      maxTokens: 1024,
    });
    const llmDuration = performance.now() - llmStartTime

    const totalDuration = performance.now() - perfStartTime
    console.log(`✅ [API:Satisfaction] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Analysis complete in ${totalDuration.toFixed(2)}ms (LLM: ${llmDuration.toFixed(2)}ms):\n`, result);

    return NextResponse.json(result);
  } catch (error) {
    const errorDuration = performance.now() - perfStartTime
    console.error(`❌ [API:Satisfaction] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Error after ${errorDuration.toFixed(2)}ms:`, {
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