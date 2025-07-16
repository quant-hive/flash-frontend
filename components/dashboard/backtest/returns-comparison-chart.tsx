"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ReturnData } from "@/types/backtest-service"

interface ReturnsComparisonChartProps {
  data: ReturnData[]
}

export function ReturnsComparisonChart({ data }: ReturnsComparisonChartProps) {
  const { theme } = useTheme()
  
  // Pre-process data
  const chartData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString(),
    strategy: point.strategy_return * 100, // Convert to percentage
    benchmark: point.benchmark_return * 100, // Convert to percentage
  }))
  
  // Calculate cumulative returns
  const cumulativeData = data.reduce((acc, current, index) => {
    // For the first data point
    if (index === 0) {
      acc.push({
        date: new Date(current.date).toLocaleDateString(),
        strategy: (1 + current.strategy_return) * 100 - 100,
        benchmark: (1 + current.benchmark_return) * 100 - 100
      })
      return acc
    }
    
    // For subsequent data points
    const prevCumulative = acc[index - 1]
    acc.push({
      date: new Date(current.date).toLocaleDateString(),
      strategy: ((1 + prevCumulative.strategy / 100) * (1 + current.strategy_return) - 1) * 100,
      benchmark: ((1 + prevCumulative.benchmark / 100) * (1 + current.benchmark_return) - 1) * 100
    })
    return acc
  }, [] as Array<{ date: string; strategy: number; benchmark: number }>)
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm">
              <span className="text-blue-500">●</span> Strategy: {payload[0].value.toFixed(2)}%
            </p>
            <p className="text-sm">
              <span className="text-orange-500">●</span> Benchmark: {payload[1].value.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      )
    }
    return null
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Strategy vs Benchmark Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                stroke={theme === "dark" ? "#888888" : "#333333"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Only show some of the dates to avoid overcrowding
                  const dateObj = new Date(value)
                  return `${dateObj.getMonth() + 1}/${dateObj.getFullYear().toString().substr(-2)}`
                }}
              />
              <YAxis
                stroke={theme === "dark" ? "#888888" : "#333333"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="strategy"
                name="Strategy"
                stroke={theme === "dark" ? "#3b82f6" : "#2563eb"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="Benchmark"
                stroke={theme === "dark" ? "#f97316" : "#ea580c"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 