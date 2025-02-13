import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReasoningCollapse } from "./reasoning-collapse"

interface SatisfactionScoreProps {
  score: number
  reasoning: string
}

export function SatisfactionScore({ score, reasoning }: SatisfactionScoreProps) {
  const getScoreColor = (score: number) => {
    switch (score) {
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-orange-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-green-500'
      case 5:
        return 'bg-emerald-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'Very Dissatisfied'
      case 2:
        return 'Dissatisfied'
      case 3:
        return 'Neutral'
      case 4:
        return 'Satisfied'
      case 5:
        return 'Very Satisfied'
      default:
        return 'Unknown'
    }
  }

  const getScoreGradient = () => {
    const segments = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-emerald-500',
    ]
    return segments.map((color, i) => (
      <div
        key={i}
        className={`flex-1 h-2 ${color} ${i === 0 ? 'rounded-l-full' : ''} ${
          i === segments.length - 1 ? 'rounded-r-full' : ''
        }`}
      />
    ))
  }

  // Calculate the center position of the appropriate segment
  const getIndicatorPosition = (score: number) => {
    const segmentWidth = 100 / 5 // Each segment is 20% wide
    const segmentIndex = score - 1 // Convert score (1-5) to index (0-4)
    return (segmentIndex * segmentWidth) + (segmentWidth / 2) // Center of the segment
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
        <CardTitle className="text-lg font-semibold text-[#0066cc]">User Satisfaction</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`text-base font-medium ${getScoreColor(score).replace('bg-', 'text-')}`}>
              {getScoreLabel(score)}
            </span>
            <span className="text-sm text-gray-500">
              Score: {score}/5
            </span>
          </div>

          <div className="relative">
            <div className="flex h-2">
              {getScoreGradient()}
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md transform -translate-x-1/2 transition-all duration-300"
              style={{ left: `${getIndicatorPosition(score)}%` }}
            />
          </div>

          <ReasoningCollapse reasoning={reasoning} />
        </div>
      </CardContent>
    </Card>
  )
}