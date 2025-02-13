'use client'

import { motion } from "framer-motion"
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { SatisfactionScore } from "./satisfaction-score"

interface EvaluationResultsProps {
  transcript: string
  isLoading?: boolean
}

interface SatisfactionResponse {
  score: number
  reasoning: string
}

export function EvaluationResults({ transcript, isLoading }: EvaluationResultsProps) {
  const [satisfaction, setSatisfaction] = useState<SatisfactionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSatisfaction, setIsLoadingSatisfaction] = useState(false)

  useEffect(() => {
    const fetchSatisfactionScore = async () => {
      if (!transcript) {
        console.log('⚠️ [Satisfaction] No transcript provided, skipping satisfaction analysis');
        return;
      }

      console.log('🔵 [Satisfaction] Starting satisfaction analysis...');
      setIsLoadingSatisfaction(true)
      setError(null)

      try {
        console.log('📊 [Satisfaction] Making API request...');
        const response = await fetch('/api/satisfaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript }),
        });

        console.log('📊 [Satisfaction] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ [Satisfaction] API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Satisfaction] Successfully received satisfaction data:', data);

        if (!data.score || typeof data.score !== 'number' || !data.reasoning) {
          console.error('❌ [Satisfaction] Invalid response format:', data);
          throw new Error('Invalid satisfaction score response format');
        }

        setSatisfaction(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ [Satisfaction] Error:', {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined
        });
        setError(`Failed to analyze user satisfaction: ${errorMessage}`);
      } finally {
        setIsLoadingSatisfaction(false);
      }
    };

    fetchSatisfactionScore();
  }, [transcript]);

  if (isLoading || isLoadingSatisfaction) {
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
      <Card className="overflow-hidden">
        <CardHeader
          className="bg-gradient-to-br from-blue-50 to-white cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#0066cc]">Chat Transcript</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {transcript}
          </pre>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {satisfaction && (
          <SatisfactionScore
            score={satisfaction.score}
            reasoning={satisfaction.reasoning}
          />
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
            <CardTitle className="text-lg font-semibold text-[#0066cc]">Evaluation Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {satisfaction ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <span className="text-xl font-medium">Success</span>
                </>
              ) : (
                <span className="text-xl font-medium">Unknown</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

