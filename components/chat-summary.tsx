import { EvalCard } from "@/components/ui/eval-card"

interface ChatSummaryProps {
  summary: string | null
  isLoading?: boolean
}

export function ChatSummary({ summary, isLoading = false }: ChatSummaryProps) {
  return (
    <EvalCard title="Chat Summary">
      {isLoading ? (
        <div className="h-12 animate-pulse bg-muted rounded" />
      ) : summary ? (
        <p className="text-sm leading-6 text-muted-foreground font-inter">
          {summary}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground font-inter">
          No summary available
        </p>
      )}
    </EvalCard>
  )
}