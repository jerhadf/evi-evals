import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChatSummaryProps {
  summary: string | null
  isLoading?: boolean
}

export function ChatSummary({ summary, isLoading = false }: ChatSummaryProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Chat Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-12 animate-pulse bg-muted rounded" />
        ) : summary ? (
          <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No summary available</p>
        )}
      </CardContent>
    </Card>
  )
}