// Interfaces and error class for backtest service
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

export interface TickerResponse {
  tickers: string[];
}

export interface DatabaseInfo {
  database_path: string;
  start_date: string | null;
  end_date: string | null;
}
