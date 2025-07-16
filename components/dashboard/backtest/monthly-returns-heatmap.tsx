"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import { ReturnData } from "@/types/backtest-service"

// Dynamically import ApexCharts to prevent SSR issues with a loading fallback
const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />
})

interface MonthlyReturnsHeatmapProps {
  returnsData: ReturnData[]
}

export function MonthlyReturnsHeatmap({ returnsData }: MonthlyReturnsHeatmapProps) {
  const [chartWidth, setChartWidth] = useState<number>(0)
  const [isMounted, setIsMounted] = useState(false)
  
  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
    
    // Handle resize events
    const handleResize = () => {
      setChartWidth(window.innerWidth)
    }
    
    // Set initial width
    handleResize()
    
    // Add resize listener
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Calculate monthly returns from strategy returns data (memoized)
  const monthlyReturns = useMemo(() => {
    return calculateMonthlyReturns(returnsData)
  }, [returnsData])
  
  // Process monthly returns for heatmap (memoized)
  const chartData = useMemo(() => {
    // Process monthly returns for heatmap
    const years = Array.from(new Set(monthlyReturns.map(r => r.year))).sort()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const series = years.map(year => {
      return {
        name: year.toString(),
        data: months.map((_, monthIndex) => {
          const monthReturn = monthlyReturns.find(r => 
            r.year === year && r.month === monthIndex + 1
          )
          return monthReturn ? monthReturn.return * 100 : null // Convert to percentage
        })
      }
    })
    
    return {
      series,
      options: {
        chart: {
          type: 'heatmap' as 'heatmap',
          toolbar: {
            show: false
          },
          animations: {
            speed: 500
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: number) {
            return val ? val.toFixed(2) + '%' : '0%'
          },
          style: {
            fontSize: '10px'
          }
        },
        colors: ["#008FFB"],
        title: {
          text: ''
        },
        xaxis: {
          categories: months,
          labels: {
            style: {
              fontSize: '11px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '11px'
            }
          }
        },
        plotOptions: {
          heatmap: {
            radius: 0,
            enableShades: true,
            colorScale: {
              ranges: [
                {
                  from: -20,
                  to: -5,
                  color: '#FF4560',
                  name: 'loss'
                },
                {
                  from: -5,
                  to: 0,
                  color: '#FEB019',
                  name: 'small loss'
                },
                {
                  from: 0,
                  to: 5,
                  color: '#00E396',
                  name: 'small gain'
                },
                {
                  from: 5,
                  to: 20,
                  color: '#008FFB',
                  name: 'gain'
                }
              ]
            }
          }
        },
        responsive: [{
          breakpoint: 768,
          options: {
            dataLabels: {
              enabled: false
            }
          }
        }]
      }
    }
  }, [monthlyReturns])
  
  // Determine font size based on screen width
  const fontSize = chartWidth < 768 ? '10px' : '11px'
  
  // If no data is available
  if (returnsData.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Monthly Returns</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[320px]">
          <p className="text-muted-foreground">No monthly returns data available</p>
        </CardContent>
      </Card>
    )
  }
  
  // If not mounted yet (SSR), show skeleton
  if (!isMounted) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Monthly Returns</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Monthly Returns</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-2 md:p-4">
        <div className="h-[320px]">
          <ReactApexChart 
            options={{
              ...chartData.options,
              xaxis: {
                ...chartData.options.xaxis,
                labels: {
                  style: {
                    fontSize
                  }
                }
              },
              yaxis: {
                labels: {
                  style: {
                    fontSize
                  }
                }
              }
            }}
            series={chartData.series} 
            type="heatmap" 
            height="100%" 
            width="100%"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Function to calculate monthly returns from daily returns data
function calculateMonthlyReturns(returnsData: ReturnData[]) {
  // Group returns by month
  const monthlyData: Record<string, { 
    returns: number[], 
    year: number, 
    month: number 
  }> = {}
  
  // Early return for empty data
  if (!returnsData || returnsData.length === 0) {
    return []
  }
  
  try {
    // Sort data by date
    const sortedData = [...returnsData].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
    
    // Group by month
    sortedData.forEach(point => {
      if (!point.date) return
      
      try {
        const date = new Date(point.date)
        
        if (isNaN(date.getTime())) {
          console.error("Invalid date format:", point.date)
          return
        }
        
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // 1-12
        const key = `${year}-${month}`
        
        if (!monthlyData[key]) {
          monthlyData[key] = {
            returns: [],
            year,
            month
          }
        }
        
        monthlyData[key].returns.push(point.strategy_return)
      } catch (err) {
        console.error("Error processing return data point:", err)
      }
    })
    
    // Calculate monthly return for each month
    return Object.entries(monthlyData).map(([key, data]) => {
      // Calculate cumulative return for the month
      const cumulativeReturn = data.returns.reduce((acc, ret) => {
        return acc * (1 + ret)
      }, 1) - 1
      
      return {
        monthKey: key,
        year: data.year,
        month: data.month,
        return: cumulativeReturn
      }
    })
  } catch (err) {
    console.error("Error calculating monthly returns:", err)
    return []
  }
}
