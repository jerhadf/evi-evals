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
  const [isLoadingSatisfaction, setIsLoadingSatisfaction] = useState(false)
  const [isLoadingChatSuccess, setIsLoadingChatSuccess] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (!transcript) {
        console.log('⚠️ No transcript provided, skipping evaluations')
        return
      }

      console.log('🔵 Starting evaluations...')
      setIsLoadingSatisfaction(true)
      setIsLoadingChatSuccess(true)
      setIsSummaryLoading(true)
      setError(null)

      try {
        // Start all API calls in parallel
        const [satisfactionPromise, successPromise, summaryPromise] = [
          fetch("/api/satisfaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
          }),
          fetch("/api/chat-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, successCriteria }),
          }),
          fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
          })
        ]

        // Wait for all results
        const [satisfactionResponse, successResponse, summaryResponse] = await Promise.all([
          satisfactionPromise,
          successPromise,
          summaryPromise
        ])

        // Handle satisfaction response
        if (!satisfactionResponse.ok) {
          const errorData = await satisfactionResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Satisfaction API error: ${satisfactionResponse.status}`);
        }
        const satisfactionData = await satisfactionResponse.json();
        setSatisfaction(satisfactionData);

        // Handle chat success response
        if (!successResponse.ok) {
          const errorData = await successResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Chat success API error: ${successResponse.status}`);
        }
        const chatSuccessData = await successResponse.json();
        setChatSuccess(chatSuccessData);

        // Handle summary response
        if (!summaryResponse.ok) {
          const errorData = await summaryResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Summary API error: ${summaryResponse.status}`);
        }
        const summaryData = await summaryResponse.json();
        setSummary(summaryData.summary);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ [Evaluations] Error:', {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(`Failed to complete evaluations: ${errorMessage}`);
      } finally {
        setIsLoadingSatisfaction(false);
        setIsLoadingChatSuccess(false);
        setIsSummaryLoading(false);
      }
    };

    fetchResults();
  }, [transcript, successCriteria]);

  if (isLoading || isLoadingSatisfaction || isLoadingChatSuccess || isSummaryLoading) {
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
          isLoading={isSummaryLoading}
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

