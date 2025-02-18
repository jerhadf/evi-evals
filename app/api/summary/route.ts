import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

// Initialize model - SDK will use GOOGLE_GENERATIVE_AI_API_KEY
const MODEL = google('gemini-2.0-flash')

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
      )
    }

    console.log(`🔄 [API:Summary] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Generating summary for transcript of length ${transcript.length} chars`)

    // Read the prompt template
    const promptPath = path.join(process.cwd(), 'prompts', 'summarization.txt')
    const promptTemplate = await fs.readFile(promptPath, 'utf8')

    // Generate summary using Vercel AI SDK
    const llmStartTime = performance.now()
    const { text: summary } = await generateText({
      model: MODEL,
      prompt: promptTemplate.replace('{transcript}', transcript)
    })
    const llmDuration = performance.now() - llmStartTime

    const totalDuration = performance.now() - perfStartTime
    console.log(`✅ [API:Summary] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Analysis complete in ${totalDuration.toFixed(2)}ms (LLM: ${llmDuration.toFixed(2)}ms):\n${summary}`);

    return NextResponse.json({ summary })
  } catch (error) {
    const errorDuration = performance.now() - perfStartTime
    console.error(`❌ [API:Summary] [${new Date().toLocaleTimeString('en-US', { hour12: true })}] Error after ${errorDuration.toFixed(2)}ms:`, {
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