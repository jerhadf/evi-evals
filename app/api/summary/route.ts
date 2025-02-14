import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

// Initialize model - SDK will use GOOGLE_GENERATIVE_AI_API_KEY
const MODEL = google('gemini-2.0-flash')

export async function POST(req: Request) {
  try {
    const startTime = performance.now()
    console.log(`🚀 Starting summary generation with Gemini at ${new Date().toLocaleString()}`)

    const { transcript } = await req.json()
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      )
    }

    console.log('🤖 [Summary] Sending request to Gemini with transcript length:', transcript.length)

    // Read the prompt template
    const promptPath = path.join(process.cwd(), 'prompts', 'summarization.txt')
    const promptTemplate = await fs.readFile(promptPath, 'utf8')

    // Generate summary using Vercel AI SDK
    const { text: summary } = await generateText({
      model: MODEL,
      prompt: promptTemplate.replace('{transcript}', transcript)
    })

    const endTime = performance.now()
    console.log(`✅ [Summary] Generated summary in ${(endTime - startTime).toFixed(2)}ms`)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('❌ [Summary] Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}