'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from 'lucide-react'
import EvaluationResults from './evaluation-results'

export default function EvaluationForm() {
  const [chatId, setChatId] = useState('')
  const [successCriteria, setSuccessCriteria] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState({
    satisfactionScore: 0,
    status: 'unknown' as 'success' | 'failure' | 'unknown'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate results (replace with actual API call)
    setResults({
      satisfactionScore: Math.floor(Math.random() * 100),
      status: ['success', 'failure', 'unknown'][Math.floor(Math.random() * 3)] as 'success' | 'failure' | 'unknown'
    })
    
    setIsLoading(false)
    setShowResults(true)
  }

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.form
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl mx-auto"
          >
            <div className="space-y-2">
              <label htmlFor="chatId" className="block text-lg font-medium text-gray-700">
                Chat ID
              </label>
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter Chat ID"
                required
                className="w-full rounded-lg text-lg p-6 transition-all duration-200 border-2 hover:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="successCriteria" className="block text-lg font-medium text-gray-700">
                Success Criteria
              </label>
              <Textarea
                id="successCriteria"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                placeholder="Success Criteria: Please describe the specific outcomes or goals that would indicate successful completion of the AI's task. Consider including measurable metrics or clear indicators of success."
                required
                className="w-full h-48 rounded-lg text-lg p-6 transition-all duration-200 border-2 hover:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc] focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full max-w-md bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold py-6 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Running Evaluation...
                  </span>
                ) : (
                  'Run Evaluation'
                )}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EvaluationResults
              satisfactionScore={results.satisfactionScore}
              status={results.status}
            />
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setShowResults(false)}
                className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Start New Evaluation
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

