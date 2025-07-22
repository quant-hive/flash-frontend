"use client"

import { useTheme } from "next-themes"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface DrawdownChartProps {
  data: Array<{ date: string; drawdown: number }>
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const { theme } = useTheme()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground">Drawdown: {payload[0].value.toFixed(2)}%</p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="date"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`
          }}
        />
        <YAxis
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toFixed(0)}%`}
          domain={[0, "dataMax + 5"]}
          reversed
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke={theme === "dark" ? "#ef4444" : "#dc2626"}
          fill={theme === "dark" ? "rgba(239, 68, 68, 0.2)" : "rgba(220, 38, 38, 0.1)"}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
