"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Trade } from "@/types/backtest-service"

interface TradeReportProps {
  trades: Trade[]
}

export function TradeReport({ trades }: TradeReportProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  
  // Custom debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Memoize filtered trades for performance
  const filteredTrades = useMemo(() => {
    if (!debouncedQuery) return trades;
    
    return trades.filter(trade => 
      trade.ticker.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      trade.trade_type.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [trades, debouncedQuery]);
  
  // Memoize summary statistics
  const summaryStats = useMemo(() => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.pnl > 0).length;
    const losingTrades = trades.filter(trade => trade.pnl < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(2) : "0.00";
    
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgReturn = trades.length > 0 
      ? (trades.reduce((sum, trade) => sum + trade.returns_percentage, 0) / trades.length).toFixed(2) 
      : "0.00";
      
    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL,
      avgReturn
    };
  }, [trades]);
  
  // Display limited rows for performance
  const displayTrades = useMemo(() => {
    // Limit to 1000 rows for performance
    return filteredTrades.slice(0, 1000);
  }, [filteredTrades]);
  
  // Show warning for large datasets
  const isTruncated = filteredTrades.length > 1000;
  
  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Trade Report</CardTitle>
        <div className="flex flex-col sm:flex-row sm:justify-between mt-2 gap-2">
          <div className="flex flex-wrap gap-4">
            <div className="stat-container">
              <span className="text-sm text-muted-foreground">Total Trades</span>
              <p className="text-lg font-semibold">{summaryStats.totalTrades}</p>
            </div>
            <div className="stat-container">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <p className="text-lg font-semibold">{summaryStats.winRate}%</p>
            </div>
            <div className="stat-container">
              <span className="text-sm text-muted-foreground">Total P&L</span>
              <p className={`text-lg font-semibold ${summaryStats.totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                Rs. {summaryStats.totalPnL.toFixed(2)}
              </p>
            </div>
            <div className="stat-container">
              <span className="text-sm text-muted-foreground">Avg Return</span>
              <p className={`text-lg font-semibold ${parseFloat(summaryStats.avgReturn) >= 0 ? "text-green-500" : "text-red-500"}`}>
                {summaryStats.avgReturn}%
              </p>
            </div>
          </div>
          <Input
            placeholder="Search trades..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-xs"
            aria-label="Search trades by ticker or type"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Return %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTrades.length > 0 ? (
                displayTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.ticker}</TableCell>
                    <TableCell>{trade.trade_type}</TableCell>
                    <TableCell>{formatDate(trade.entry_date)}</TableCell>
                    <TableCell>{formatDate(trade.exit_date)}</TableCell>
                    <TableCell>Rs. {trade.entry_price.toFixed(2)}</TableCell>
                    <TableCell>Rs. {trade.exit_price.toFixed(2)}</TableCell>
                    <TableCell className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                      Rs. {trade.pnl.toFixed(2)}
                    </TableCell>
                    <TableCell className={trade.returns_percentage >= 0 ? "text-green-500" : "text-red-500"}>
                      {trade.returns_percentage.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No trades found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {isTruncated && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing 1000 of {filteredTrades.length} trades. Use search to filter for more specific results.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 