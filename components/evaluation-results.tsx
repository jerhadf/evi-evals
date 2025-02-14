'use client'

import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ChevronDown } from 'lucide-react'
import { useState, useEffect } from "react"
import { SatisfactionScore } from "./satisfaction-score"
import { ChatSuccess } from "./chat-success"
import { ChatSummary } from "./chat-summary"
import { EvalCard } from "@/components/ui/eval-card"
import { Button } from "@/components/ui/button"

interface EvaluationResultsProps {
  transcript: string
  successCriteria: string
  isLoading?: boolean
}

interface SatisfactionResponse {
  score: number
  reasoning: string
}

interface ChatSuccessResponse {
  status: 'success' | 'failure' | 'unknown'
  reasoning: string
}

export function EvaluationResults({ transcript, successCriteria, isLoading }: EvaluationResultsProps) {
  const [satisfaction, setSatisfaction] = useState<SatisfactionResponse | null>(null)
  const [chatSuccess, setChatSuccess] = useState<ChatSuccessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)

  useEffect(() => {
    // Skip if no transcript or already loading
    if (!transcript || isLoading || isLoadingResults) {
      return
    }

    let isMounted = true
    const controller = new AbortController()

    const fetchResults = async () => {
      console.log('🔵 [Evaluations] Starting API calls')
      setIsLoadingResults(true)
      setError(null)

      try {
        // Create all API requests with the same signal
        const requests = {
          satisfaction: fetch("/api/satisfaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
            signal: controller.signal
          }),
          success: fetch("/api/chat-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, successCriteria }),
            signal: controller.signal
          }),
          summary: fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
            signal: controller.signal
          })
        }

        // Execute all requests in parallel
        const [satisfactionRes, successRes, summaryRes] = await Promise.all([
          requests.satisfaction,
          requests.success,
          requests.summary
        ])

        // Handle responses in parallel
        const results = await Promise.all([
          satisfactionRes.json(),
          successRes.json(),
          summaryRes.json()
        ])

        // Only update state if component is still mounted
        if (isMounted) {
          const [satisfactionData, chatSuccessData, summaryData] = results

          if (satisfactionData.error || chatSuccessData.error || summaryData.error) {
            throw new Error('One or more API calls failed')
          }

          setSatisfaction(satisfactionData)
          setChatSuccess(chatSuccessData)
          setSummary(summaryData.summary)
          console.log('✅ [Evaluations] Successfully completed all API calls')
        }
      } catch (err) {
        // Only update error state if this isn't an abort error and component is mounted
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🔵 [Evaluations] Request cancelled')
          return
        }

        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          console.error('❌ [Evaluations] Error:', {
            error: err,
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined
          })
          setError(`Failed to complete evaluations: ${errorMessage}`)
        }
      } finally {
        if (isMounted) {
          setIsLoadingResults(false)
        }
      }
    }

    fetchResults()

    // Cleanup function
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [transcript, successCriteria, isLoading]) // Add isLoading to dependencies

  if (isLoading || isLoadingResults) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Analyzing conversation...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {satisfaction && (
          <SatisfactionScore
            score={satisfaction.score}
            reasoning={satisfaction.reasoning}
          />
        )}
        {chatSuccess && (
          <ChatSuccess
            status={chatSuccess.status}
            reasoning={chatSuccess.reasoning}
          />
        )}
      </div>

      <div className="w-full">
        <ChatSummary
          summary={summary}
        />
      </div>

      <div className="w-full">
        <EvalCard>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0066cc]">Chat Transcript</h3>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 p-0"
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isTranscriptOpen ? "transform rotate-180" : ""
                }`}
              />
              <span className="sr-only">Toggle transcript</span>
            </Button>
          </div>
          <AnimatePresence>
            {isTranscriptOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {transcript}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </EvalCard>
      </div>
    </motion.div>
  )
}

