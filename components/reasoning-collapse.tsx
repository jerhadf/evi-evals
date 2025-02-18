import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ReasoningCollapseProps {
  reasoning: string
}

export function ReasoningCollapse({ reasoning }: ReasoningCollapseProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 px-3 hover:bg-blue-50 rounded-lg"
      >
        <span className="text-sm text-gray-600 font-medium">
          {isOpen ? 'Hide Reasoning' : 'Show Reasoning'}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
              {reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}