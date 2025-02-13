import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { ReasoningCollapse } from "./reasoning-collapse"

interface ChatSuccessProps {
  status: 'success' | 'failure' | 'unknown'
  reasoning: string
}

export function ChatSuccess({ status, reasoning }: ChatSuccessProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case 'failure':
        return <XCircle className="w-12 h-12 text-red-500" />
      case 'unknown':
        return <HelpCircle className="w-12 h-12 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50'
      case 'failure':
        return 'text-red-700 bg-red-50'
      case 'unknown':
        return 'text-yellow-700 bg-yellow-50'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
        <CardTitle className="text-lg font-semibold text-[#0066cc]">Chat Success</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor()} capitalize`}>
                {status}
              </div>
            </div>
          </div>
          <ReasoningCollapse reasoning={reasoning} />
        </div>
      </CardContent>
    </Card>
  )
}