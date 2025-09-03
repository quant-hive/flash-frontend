"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Papa from "papaparse";
import { backtestService, databaseService } from "@/lib/backtest-service";
import type {
  BacktestResults,
  BenchmarkReturns,
  ReturnData,
  Trade,
} from "@/types/backtest-service";

export interface TradeData {
  ticker: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  return_pct: number;
}

export interface MonthlyReturn {
  month: string;
  year: number;
  return: number;
}

export interface BacktestCsvData {
  equityCurve: { date: string; equity: number }[];
  drawdowns: { date: string; drawdown: number }[];
  trades: TradeData[];
  monthlyReturns: MonthlyReturn[];
}

interface BacktestContextState {
  backtestId: string;
  results: BacktestResults | null;
  benchmarkData: BenchmarkReturns | null;
  csvData: BacktestCsvData | null;
  tradeData: Trade[];
  returnsData: ReturnData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  downloadReport: (format: "csv" | "html") => void;
  openDebugView: () => void;
}

const BacktestResultsContext = createContext<BacktestContextState | undefined>(
  undefined
);

export function useBacktestResults() {
  const ctx = useContext(BacktestResultsContext);
  if (!ctx)
    throw new Error(
      "useBacktestResults must be used within BacktestResultsProvider"
    );
  return ctx;
}

export function BacktestResultsProvider({
  backtestId,
  initialResults,
  children,
}: {
  backtestId: string;
  initialResults?: BacktestResults | null;
  children: React.ReactNode;
}) {
  const [results, setResults] = useState<BacktestResults | null>(
    initialResults ?? null
  );
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkReturns | null>(
    null
  );
  const [csvData, setCsvData] = useState<BacktestCsvData | null>(null);
  const [tradeData, setTradeData] = useState<Trade[]>([]);
  const [returnsData, setReturnsData] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_RETRIES = 3;

  const fetchBacktestResults = useCallback(async () => {
    if (results) return results; // reuse if provided
    const r = await backtestService.getBacktestResults(backtestId);
    setResults(r);
    return r;
  }, [backtestId, results]);

  const fetchTradeData = useCallback(
    async (id: string, attempt = 0): Promise<void> => {
      try {
        const trades = await backtestService.getTradeReports(id);
        if (Array.isArray(trades)) setTradeData(trades);
      } catch (e) {
        if (attempt + 1 < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
          return fetchTradeData(id, attempt + 1);
        }
        throw e;
      }
    },
    []
  );

  const fetchReturnsData = useCallback(
    async (id: string, attempt = 0): Promise<void> => {
      try {
        const returns = await backtestService.getReturnsData(id);
        if (Array.isArray(returns)) setReturnsData(returns);
      } catch (e) {
        if (attempt + 1 < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
          return fetchReturnsData(id, attempt + 1);
        }
        throw e;
      }
    },
    []
  );

  const fetchCsvData = useCallback(async (id: string): Promise<void> => {
    const csvUrl = backtestService.getBacktestReportUrl(id, "csv");
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const parsedData = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
    });

    if (parsedData.data && (parsedData.data as any[]).length > 0) {
      const rows = parsedData.data as any[];
      const equityCurve = rows
        .filter((row) => row.date && row.equity)
        .map((row) => ({ date: row.date, equity: parseFloat(row.equity) }));

      const drawdowns = rows
        .filter((row) => row.date && row.drawdown !== undefined)
        .map((row) => ({ date: row.date, drawdown: parseFloat(row.drawdown) }));

      const trades = rows
        .filter((row) => row.ticker && row.entry_date && row.exit_date)
        .map((row) => ({
          ticker: row.ticker,
          entry_date: row.entry_date,
          exit_date: row.exit_date,
          entry_price: parseFloat(row.entry_price),
          exit_price: parseFloat(row.exit_price),
          pnl: parseFloat(row.pnl),
          return_pct: parseFloat(row.return_pct),
        }));

      const monthlyReturns = rows
        .filter((row) => row.month && row.return !== undefined)
        .map((row) => {
          const [year, month] = String(row.month).split("-");
          return {
            month,
            year: parseInt(year),
            return: parseFloat(row.return),
          };
        });

      setCsvData({ equityCurve, drawdowns, trades, monthlyReturns });
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const r = await fetchBacktestResults();

      const startDate = r.start_date || "2020-01-01";
      const endDate = r.end_date || "2023-01-01";
      const benchmark = await databaseService.getBenchmarkReturns(
        startDate,
        endDate
      );
      setBenchmarkData(benchmark);

      await Promise.all([
        fetchTradeData(backtestId),
        fetchReturnsData(backtestId),
        fetchCsvData(backtestId),
      ]);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "Failed to fetch backtest data"
      );
    } finally {
      setLoading(false);
    }
  }, [
    backtestId,
    fetchBacktestResults,
    fetchCsvData,
    fetchReturnsData,
    fetchTradeData,
  ]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backtestId]);

  const downloadReport = useCallback(
    (format: "csv" | "html") => {
      const url = backtestService.getBacktestReportUrl(backtestId, format);
      window.open(url, "_blank");
    },
    [backtestId]
  );

  const openDebugView = useCallback(() => {
    const url = backtestService.getBacktestDebugUrl(backtestId);
    window.open(url, "_blank");
  }, [backtestId]);

  const value = useMemo<BacktestContextState>(
    () => ({
      backtestId,
      results,
      benchmarkData,
      csvData,
      tradeData,
      returnsData,
      loading,
      error,
      refetch,
      downloadReport,
      openDebugView,
    }),
    [
      backtestId,
      results,
      benchmarkData,
      csvData,
      tradeData,
      returnsData,
      loading,
      error,
      refetch,
      downloadReport,
      openDebugView,
    ]
  );

  return (
    <BacktestResultsContext.Provider value={value}>
      {children}
    </BacktestResultsContext.Provider>
  );
}
