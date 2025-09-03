"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useBacktestResults } from "@/context/backtest-results-context";
import { LoadingState } from "@/components/dashboard/backtest/loading-state";
import { ErrorState } from "@/components/dashboard/backtest/error-state";
import ResultMetricCard from "@/components/result-metric-card";

// Format number in Indian numbering system with conditional decimals
// - If integer: 1 decimal place (e.g., 1,23,456.0)
// - If has decimals: exactly 2 decimal places (e.g., 1,23,456.78)
function formatIndianNumber(value: number) {
  const hasDecimals = Math.abs(value % 1) > 1e-9;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 1,
    maximumFractionDigits: hasDecimals ? 2 : 1,
  }).format(value);
}

const Trades = () => {
  const { loading, error } = useBacktestResults();
  const trades = useBacktestResults().tradeData;
  const [viewMoreMetrics, setViewMoreMetrics] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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

    return trades.filter(
      (trade) =>
        trade.ticker.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        trade.trade_type.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [trades, debouncedQuery]);

  // Memoize summary statistics
  const summaryStats = useMemo(() => {
    const totalTrades = trades.length; // keep as number for calculations
    const winningTrades = trades.filter((trade) => trade.pnl > 0).length;
    const losingTrades = trades.filter((trade) => trade.pnl < 0).length;
    const winRate =
      totalTrades > 0
        ? ((winningTrades / totalTrades) * 100).toFixed(2)
        : "0.00";

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgReturn =
      trades.length > 0
        ? (
            trades.reduce((sum, trade) => sum + trade.returns_percentage, 0) /
            trades.length
          ).toFixed(2)
        : "0.00";

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL,
      avgReturn,
    };
  }, [trades]);

  // Formatted Total P&L (Indian grouping with conditional decimals)
  const formattedTotalPnL = useMemo(
    () => formatIndianNumber(summaryStats.totalPnL),
    [summaryStats.totalPnL]
  );

  // Display limited rows for performance
  const displayTrades = useMemo(() => {
    // Limit to 1000 rows for performance
    return filteredTrades.slice(0, 1000);
  }, [filteredTrades]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onClose={() => {}} />;

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      {trades && trades.length > 0 ? (
        <>
          <div className="flex flex-col">
            <h1 className="text-2xl font-light">Trades</h1>
            <div className="grid grid-cols-4 gap-[10px] mt-3">
              <ResultMetricCard
                title="Total Trades"
                value={summaryStats.totalTrades.toFixed(0)}
                suffix=""
                iconSrc="/svgs/total-return.svg"
                iconAlt="Total Return Icon Image"
                shadow="black"
              />

              <ResultMetricCard
                title="Winning Rate"
                value={summaryStats.winRate}
                suffix="%"
                iconSrc="/svgs/winning-rate.svg"
                iconAlt="Winning Rate Icon Image"
                shadow="green"
              />

              <ResultMetricCard
                title="Total P&L (INR)"
                value={formattedTotalPnL}
                suffix=""
                iconSrc="/svgs/total-pnl.svg"
                iconAlt="Total P&L Icon Image"
                shadow="green"
              />

              <ResultMetricCard
                title="Average Return"
                value={summaryStats.avgReturn}
                suffix="%"
                iconSrc="/svgs/avg-return.svg"
                iconAlt="Average Return Icon Image"
                shadow="green"
              />
            </div>

            {/* {viewMoreMetrics && (
              <div className="grid grid-cols-4 gap-[10px] items-center mt-4"></div>
            )} */}
          </div>

          <div className="flex flex-row items-center w-full mt-[40px]">
            <hr className="w-full border bg-[#2B2B2B]" />
            <button
              onClick={() => setViewMoreMetrics(!viewMoreMetrics)}
              className="flex justify-center w-60 mx-6 text-sm font-light bg-[#1B1B1D] border-2 border-[#2A2A2C] text-[#909092] py-2 rounded-sm text-nowrap"
            >
              {viewMoreMetrics ? "view less" : "view more"}
            </button>
            <hr className="w-full border bg-[#2B2B2B]" />
          </div>
        </>
      ) : (
        <div className="font-light">No trades available.</div>
      )}
    </div>
  );
};

export default Trades;
