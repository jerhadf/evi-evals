import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const satisfactionLabels = {
  1: "Very Dissatisfied",
  2: "Dissatisfied",
  3: "Neutral",
  4: "Satisfied",
  5: "Very Satisfied"
} as const;

const satisfactionColors = {
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-400",
  5: "bg-green-500"
} as const;

interface SatisfactionScoreProps {
  score: number;
  reasoning: string;
  className?: string;
}

export function SatisfactionScore({ score, reasoning, className }: SatisfactionScoreProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  return (
    <div className={cn("space-y-4 p-6 bg-white rounded-lg shadow-sm", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">User Satisfaction</h3>
          <span className="text-sm text-gray-500">Score: {score}/5</span>
        </div>

        {/* Satisfaction Slider */}
        <div className="relative pt-1">
          <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "flex-1 transition-all duration-300",
                  level <= score ? satisfactionColors[level as keyof typeof satisfactionColors] : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <div
            className="absolute -top-1 transition-all duration-300"
            style={{
              left: `${((score - 1) / 4) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md border-2 border-blue-600" />
          </div>
        </div>

        {/* Satisfaction Label */}
        <div className="text-center mt-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            {
              "bg-red-100 text-red-800": score === 1,
              "bg-orange-100 text-orange-800": score === 2,
              "bg-yellow-100 text-yellow-800": score === 3,
              "bg-green-100 text-green-800": score === 4 || score === 5,
            }
          )}>
            {satisfactionLabels[score as keyof typeof satisfactionLabels]}
          </span>
        </div>
      </div>

      {/* Expandable Reasoning */}
      <div className="border-t pt-2">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
        >
          <span>Reasoning</span>
          {isReasoningExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isReasoningExpanded && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            {reasoning}
          </div>
        )}
      </div>
    </div>
  );
}