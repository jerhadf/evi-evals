'use client'

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

interface EvaluationResultsProps {
  satisfactionScore: number
  status: 'success' | 'failure' | 'unknown'
  transcript: string
}

export default function EvaluationResults({ satisfactionScore, status, transcript }: EvaluationResultsProps) {
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)

  const statusConfig = {
    success: { icon: CheckCircle2, color: 'text-green-500', text: 'Success' },
    failure: { icon: XCircle, color: 'text-red-500', text: 'Failure' },
    unknown: { icon: HelpCircle, color: 'text-yellow-500', text: 'Unknown' }
  }

  const StatusIcon = statusConfig[status].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        <CardHeader
          className="bg-gradient-to-br from-blue-50 to-white cursor-pointer"
          onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#0066cc]">Chat Transcript</CardTitle>
            {isTranscriptExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {isTranscriptExpanded && (
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {transcript}
            </pre>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#0066cc]">User Satisfaction</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-[#0066cc] stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: `${satisfactionScore * 2.51}, 251.2`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                  }}
                />
                <text
                  x="50"
                  y="50"
                  className="text-2xl font-bold"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  {satisfactionScore}%
                </text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#0066cc]">Evaluation Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <StatusIcon className={`w-16 h-16 ${statusConfig[status].color}`} />
            <span className="text-xl font-medium">{statusConfig[status].text}</span>
          </div>
        </CardContent>
      </Card>
      </div>
    </motion.div>
  )
}

