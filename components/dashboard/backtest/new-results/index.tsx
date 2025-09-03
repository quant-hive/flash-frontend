import { backtestService, databaseService } from "@/lib/backtest-service";
import type {
  BacktestResults,
  BenchmarkReturns,
  ReturnData,
  Trade,
} from "@/types/backtest-service";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import ResultMetrics from "../../result-metrics";
import { ReturnsComparisonChart } from "../new-returns-comparison-chart";
import { DrawdownChartFromReturns } from "../new-drawdown-chrt-from-returns";
import { useBacktestResults } from "@/context/backtest-results-context";

interface BacktestResultsProps {
  backtestId: string;
  backtestResults: BacktestResults & { name?: string };
}

interface TradeData {
  ticker: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  return_pct: number;
}

interface MonthlyReturn {
  month: string;
  year: number;
  return: number;
}

interface BacktestCsvData {
  equityCurve: { date: string; equity: number }[];
  drawdowns: { date: string; drawdown: number }[];
  trades: TradeData[];
  monthlyReturns: MonthlyReturn[];
}

const BacktestResultsView = ({
  backtestId,
  backtestResults,
}: BacktestResultsProps) => {
  const { results, returnsData, error, loading } = useBacktestResults();

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !results) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      <ResultMetrics metrics={results.metrics} />

      <div className="flex flex-row gap-4 mt-4">
        <ReturnsComparisonChart data={returnsData} />
        <DrawdownChartFromReturns data={returnsData} />
      </div>
    </div>
  );
};

export default BacktestResultsView;
