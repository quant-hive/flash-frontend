"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BarChart3, Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BacktestResults } from "@/types/backtest-service"
import { backtestService } from "@/lib/backtest-service"

interface BacktestComparisonProps {
  backtestIds: string[]
}

export function BacktestComparison({ backtestIds }: BacktestComparisonProps) {
  const [results, setResults] = useState<{ [key: string]: BacktestResults | null }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({})

  useEffect(() => {
    const fetchResults = async () => {
      const initialLoading: { [key: string]: boolean } = {}
      const initialErrors: { [key: string]: string | null } = {}
      
      // Initialize states
      backtestIds.forEach(id => {
        initialLoading[id] = true
        initialErrors[id] = null
      })
      
      setLoading(initialLoading)
      setErrors(initialErrors)
      
      // Fetch results for each backtest
      const resultsPromises = backtestIds.map(async (id) => {
        try {
          const backtestResults = await backtestService.getBacktestResults(id)
          setResults(prev => ({ ...prev, [id]: backtestResults }))
          setLoading(prev => ({ ...prev, [id]: false }))
        } catch (err: any) {
          
          setErrors(prev => ({ 
            ...prev, 
            [id]: err.response?.data?.detail || err.message || `Failed to fetch results for backtest ${id}`
          }))
          setLoading(prev => ({ ...prev, [id]: false }))
        }
      })
      
      await Promise.all(resultsPromises)
    }
    
    if (backtestIds.length > 0) {
      fetchResults()
    }
  }, [backtestIds])

  if (backtestIds.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No backtests selected</AlertTitle>
        <AlertDescription>
          Please select at least one backtest to view results.
        </AlertDescription>
      </Alert>
    )
  }

  const getStatusMessage = (id: string) => {
    if (loading[id]) return <Skeleton className="h-4 w-full" />
    if (errors[id]) return <span className="text-destructive">{errors[id]}</span>
    if (!results[id]) return <span className="text-muted-foreground">No results available</span>
    return <span className="text-green-500">Results loaded</span>
  }

  const formatValue = (value: number | undefined, format: 'percent' | 'number' = 'number'): string => {
    if (value === undefined) return 'N/A'
    
    if (format === 'percent') {
      return `${value.toFixed(2)}%`
    }
    
    return value.toFixed(2)
  }

  const downloadComparison = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,Metric"
    
    // Add backtest IDs as headers
    backtestIds.forEach(id => {
      csvContent += `,${id}`
    })
    csvContent += "\n"
    
    // Add metrics
    const metricNames = [
      "Total Return", "Annual Return", "Volatility", "Sharpe", 
      "Sortino", "Max Drawdown", "Win Rate", "Beta", "Alpha"
    ]
    
    const metricKeys = [
      "total_return", "annual_return", "volatility", "sharpe", 
      "sortino", "max_drawdown", "win_rate", "beta", "alpha"
    ]
    
    metricNames.forEach((name, index) => {
      csvContent += `${name}`
      
      backtestIds.forEach(id => {
        const value = results[id]?.metrics[metricKeys[index]]
        csvContent += `,${value !== undefined ? value : ''}`
      })
      
      csvContent += "\n"
    })
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "backtest_comparison.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Comparison</CardTitle>
        <CardDescription>
          Compare metrics across multiple backtests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="metrics">Metrics Comparison</TabsTrigger>
            <TabsTrigger value="status">Status & Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backtest ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backtestIds.map(id => (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{id}</TableCell>
                    <TableCell>{getStatusMessage(id)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(backtestService.getBacktestDebugUrl(id), '_blank')}
                        disabled={!results[id]}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="metrics" className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {backtestIds.map(id => (
                    <TableHead key={id} className="text-right">
                      {id.substring(0, 8)}...
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Return</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.total_return, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Annual Return</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.annual_return, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sharpe Ratio</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.sharpe)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Sortino Ratio</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.sortino)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Max Drawdown</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.max_drawdown, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Volatility</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.volatility, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Win Rate</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.win_rate, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Beta</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.beta)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Alpha</TableCell>
                  {backtestIds.map(id => (
                    <TableCell key={id} className="text-right">
                      {loading[id] ? <Skeleton className="h-4 w-full" /> : 
                       formatValue(results[id]?.metrics.alpha, 'percent')}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="flex justify-end mt-4">
              <Button onClick={downloadComparison} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Comparison
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 