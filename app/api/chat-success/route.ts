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

// Define schema for structured output
const ChatSuccessSchema = z.object({
  reasoning: z.string().describe('Explantion for the chat success assessment, 2-5 sentences'),
  status: z.enum(['success', 'failure', 'unknown']).describe('Chat success status')
});

export async function POST(req: Request) {
  try {
    const { transcript, successCriteria } = await req.json();

    if (!transcript || !successCriteria) {
      return NextResponse.json(
        { error: 'Both transcript and success criteria are required' },
        { status: 400 }
      );
    }

    console.log('🎯 [ChatSuccess] Starting analysis with transcript length:', transcript.length);
    console.log('🎯 [ChatSuccess] Success criteria:', successCriteria);

    const { object: result } = await generateObject({
      model: anthropic('claude-3-5-sonnet-latest'),
      schema: ChatSuccessSchema,
      schemaName: 'ChatSuccess',
      schemaDescription: 'Chat success status and reasoning based on chat transcript analysis',
      system: CHAT_SUCCESS_PROMPT,
      prompt: `Please analyze the following chat transcript and success description to determine if the chat was successful.

<success_description>
${successCriteria}
</success_description>

<transcript>
${transcript}
</transcript>

Based on the above, reason whether the chat was successful or not and provide the resulting status and reasoning.`,
      temperature: 0.5,
      maxTokens: 1024,
    });

    console.log('✅ [ChatSuccess] Analysis complete:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ [ChatSuccess] Error:', {
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