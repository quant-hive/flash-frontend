import axios, { isAxiosError } from "axios";
import axiosInstance from "./axios";
import {
  BacktestRequest,
  BacktestStatus,
  BacktestMetrics,
  BacktestResults,
  BenchmarkReturns,
  BacktestFormData,
  Trade,
  ReturnData,
  ApiError,
  TickerResponse,
  DatabaseInfo,
} from "@/types/backtest-service";

export interface BacktestRequest {
  prompt: string;
  tickers: string[];
  initial_cash: number;
  start_date: string;
  end_date: string;
  commission: number;
}

export interface BacktestStatus {
  backtest_id: string;
  name?: string;
  status: "pending" | "running" | "completed" | "failed";
  message: string;
  created_at?: string;
  progress?: number; // Optional progress indicator
}

export interface BacktestMetrics {
  total_return: number;
  annual_return: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  max_drawdown: number;
  win_rate: number;
  beta: number;
  alpha: number;
  [key: string]: number | string;
}

export interface BacktestResults {
  backtest_id: string;
  name?: string;
  metrics: BacktestMetrics;
  insights: string;
  improvements: string;
  strategy_code: string;
  start_date: string;
  end_date: string;
  created_at?: string;
}

export interface BenchmarkReturns {
  returns: {
    dates: string[];
    values: number[];
  };
}

export interface BacktestFormData {
  name: string;
  prompt: string;
  tickers: string[];
  initial_cash: number;
  start_date: string;
  end_date: string;
  commission: number;
}

export interface Trade {
  id: number;
  ticker: string;
  entry_date: string;
  exit_date: string;
  trade_type: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  returns_percentage: number;
}

export interface ReturnData {
  id: number;
  date: string;
  strategy_return: number;
  benchmark_return: number;
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail || error.message || "API request failed";
    const data = error.response?.data;
    throw new ApiError(message, status, data);
  }
  throw error;
};

export const backtestService = {
  // Run a new backtest
  async runBacktest(data: BacktestFormData): Promise<BacktestStatus> {
    try {
      const response = await axiosInstance.post("/api/backtest/run", data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get status of a backtest
  async getBacktestStatus(backtestId: string): Promise<BacktestStatus> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/status/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get results of a completed backtest
  async getBacktestResults(backtestId: string): Promise<BacktestResults> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/results/${backtestId}`
      );

      // Ensure the results contain the backtest_id
      return {
        ...response.data,
        backtest_id: backtestId,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get all backtests for the user
  async getUserBacktests(): Promise<BacktestStatus[]> {
    try {
      const response = await axiosInstance.get("/api/backtest/user/backtests");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete a backtest
  async deleteBacktest(backtestId: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(
        `/api/backtest/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get downloadable backtest report URL
  getBacktestReportUrl(
    backtestId: string,
    format: "csv" | "html" = "csv"
  ): string {
    return `${axiosInstance.defaults.baseURL}/api/backtest/download/${backtestId}?format=${format}`;
  },

  // Get debug URL
  getBacktestDebugUrl(backtestId: string): string {
    return `${axiosInstance.defaults.baseURL}/api/backtest/debug/${backtestId}`;
  },

  // Get trade reports
  async getTradeReports(backtestId: string): Promise<Trade[]> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/trades/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get strategy vs benchmark returns
  async getReturnsData(backtestId: string): Promise<ReturnData[]> {
    try {
      const response = await axiosInstance.get(
        `/api/backtest/returns/${backtestId}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Database service
export const databaseService = {
  // Get available tickers
  async getAvailableTickers(): Promise<string[]> {
    try {
      const response = await axiosInstance.get<TickerResponse>(
        "/api/database/tickers"
      );
      return response.data.tickers;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get database info
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      const response = await axiosInstance.get<DatabaseInfo>(
        "/api/database/info"
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get benchmark returns
  async getBenchmarkReturns(
    startDate: string,
    endDate: string
  ): Promise<BenchmarkReturns> {
    try {
      const response = await axiosInstance.get<BenchmarkReturns>(
        `/api/database/benchmark-returns/${startDate}/${endDate}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
