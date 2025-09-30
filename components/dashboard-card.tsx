import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function DashboardCard({ title, value, change, changeType = "neutral", icon: Icon }: DashboardCardProps) {
  const changeColor = {
    positive: "text-primary",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[changeType]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && <p className={`text-xs ${changeColor} mt-1`}>{change}</p>}
      </CardContent>
    </Card>
  )
}
