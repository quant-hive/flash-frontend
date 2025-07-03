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
  TickerResponse,
  DatabaseInfo,
} from "@/types/backtest-service";

// Helper function to handle API errors

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
