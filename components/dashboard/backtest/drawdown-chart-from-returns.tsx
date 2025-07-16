"use client"

import { useTheme } from "next-themes"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReturnData } from "@/types/backtest-service"

interface DrawdownChartFromReturnsProps {
  data: ReturnData[]
}

export function DrawdownChartFromReturns({ data }: DrawdownChartFromReturnsProps) {
  const { theme } = useTheme()

  // Calculate drawdown from strategy returns
  const drawdownData = calculateDrawdown(data)
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground">Drawdown: {(payload[0].value * 100).toFixed(2)}%</p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Drawdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdownData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                stroke={theme === "dark" ? "#888888" : "#333333"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const dateObj = new Date(value)
                  return `${dateObj.getMonth() + 1}/${dateObj.getFullYear().toString().substr(-2)}`
                }}
              />
              <YAxis
                stroke={theme === "dark" ? "#888888" : "#333333"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                domain={[0, "dataMax + 0.05"]}
                reversed // Reverse axis to show drawdown as negative from top
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
        </div>
      </CardContent>
    </Card>
  )
}

// Function to calculate drawdown from returns
function calculateDrawdown(data: ReturnData[]): { date: string; drawdown: number }[] {
  // Calculate cumulative returns
  let cumulativeReturn = 1
  let peakValue = 1
  
  return data.map(point => {
    // Update cumulative return
    cumulativeReturn = cumulativeReturn * (1 + point.strategy_return)
    
    // Update peak value if we have a new high
    peakValue = Math.max(peakValue, cumulativeReturn)
    
    // Calculate drawdown as the percentage decline from the peak
    const drawdown = (cumulativeReturn / peakValue) - 1
    
    return {
      date: new Date(point.date).toLocaleDateString(),
      drawdown: Math.abs(Math.min(0, drawdown)) // Convert negative values to positive for display
    }
  })
} 