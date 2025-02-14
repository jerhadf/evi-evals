import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EvalCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function EvalCard({ title, children, className, contentClassName }: EvalCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {title ? (
        <CardHeader className="bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-2.5 px-6">
          <CardTitle className="text-lg font-semibold text-[#0066cc]">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={cn(
        "bg-white p-6",
        !title && "bg-gradient-to-b from-blue-50 via-blue-50/50 to-white",
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  )
}