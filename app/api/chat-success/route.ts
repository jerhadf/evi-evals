import { NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Load chat success prompt from file
const CHAT_SUCCESS_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'prompts', 'chat-success.txt'),
  'utf-8'
);

const CLAUDE_MODEL = anthropic('claude-3-5-haiku-latest')

// Define schema for structured output
const ChatSuccessSchema = z.object({
  reasoning: z.string().describe('Explanation for the chat success assessment, 2-5 sentences'),
  status: z.enum(['success', 'failure', 'unknown']).describe('Chat success status')
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

    const { transcript, successCriteria } = body

    if (!transcript || !successCriteria) {
      return NextResponse.json(
        { error: 'Both transcript and success criteria are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 [API:ChatSuccess] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Analyzing transcript (${transcript.length} chars) against criteria: "${successCriteria}"`);

    const llmStartTime = performance.now()
    const { object: result } = await generateObject({
      model: CLAUDE_MODEL,
      schema: ChatSuccessSchema,
      schemaName: 'ChatSuccess',
      schemaDescription: 'Chat success status and reasoning based on chat transcript analysis',
      system: CHAT_SUCCESS_PROMPT,
      prompt: CHAT_SUCCESS_PROMPT
        .replace('{transcript}', transcript)
        .replace('{success_criteria}', successCriteria),
      temperature: 0.5,
      maxTokens: 1024,
    });
    const llmDuration = performance.now() - llmStartTime

    const totalDuration = performance.now() - perfStartTime
    console.log(`✅ [API:ChatSuccess] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Analysis complete in ${totalDuration.toFixed(2)}ms (LLM: ${llmDuration.toFixed(2)}ms):\n`, result);

    return NextResponse.json(result);
  } catch (error) {
    const errorDuration = performance.now() - perfStartTime
    console.error(`❌ [API:ChatSuccess] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Error after ${errorDuration.toFixed(2)}ms:`, {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to evaluate chat success' },
      { status: 500 }
    );
  }
}