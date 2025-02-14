'use client'

import { motion } from "framer-motion"
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SatisfactionScore } from "./satisfaction-score"
import { ChatSuccess } from "./chat-success"
import { ChatSummary } from "./chat-summary"

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

      <ChatSummary
        summary={summary}
        isLoading={isSummaryLoading}
      />

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#0066cc]">Chat Transcript</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {transcript}
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  )
}

