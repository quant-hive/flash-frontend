import { useState, useEffect, useCallback } from "react";
import { ApiService } from "@/lib/api-service";
import {
  BacktestStatus,
  BacktestResults,
  BacktestFormData,
  Trade,
  ReturnData,
  DatabaseInfo,
} from "@/types/backtest-service";

/**
 * Custom hook for managing API loading states and errors
 */
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for managing user backtests
 */
export function useUserBacktests() {
  const { data, loading, error, execute, reset } =
    useApiState<BacktestStatus[]>();

  const fetchBacktests = useCallback(() => {
    return execute(() => ApiService.getUserBacktests());
  }, [execute]);

  const deleteBacktest = useCallback(
    async (backtestId: string) => {
      await ApiService.deleteBacktest(backtestId);
      // Refresh the list after deletion
      return fetchBacktests();
    },
    [fetchBacktests]
  );

  useEffect(() => {
    fetchBacktests();
  }, [fetchBacktests]);

  return {
    backtests: data,
    loading,
    error,
    refetch: fetchBacktests,
    deleteBacktest,
    reset,
  };
}

/**
 * Hook for managing a single backtest
 */
export function useBacktest(backtestId: string | null) {
  const [status, setStatus] = useState<BacktestStatus | null>(null);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [returns, setReturns] = useState<ReturnData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompleteData = useCallback(async () => {
    if (!backtestId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getCompleteBacktestData(backtestId);
      setStatus(data.status);
      setResults(data.results || null);
      setTrades(data.trades || null);
      setReturns(data.returns || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch backtest data");
    } finally {
      setLoading(false);
    }
  }, [backtestId]);

  const pollStatus = useCallback(async () => {
    if (!backtestId) return;

    try {
      await ApiService.pollBacktestStatus(backtestId, (updatedStatus) => {
        setStatus(updatedStatus);
      });
      // Once completed, fetch all data
      await fetchCompleteData();
    } catch (err: any) {
      setError(err.message || "Failed to poll backtest status");
    }
  }, [backtestId, fetchCompleteData]);

  useEffect(() => {
    if (backtestId) {
      fetchCompleteData();
    }
  }, [backtestId, fetchCompleteData]);

  return {
    status,
    results,
    trades,
    returns,
    loading,
    error,
    refetch: fetchCompleteData,
    pollStatus,
  };
}

/**
 * Hook for running backtests
 */
export function useRunBacktest() {
  const { data, loading, error, execute, reset } =
    useApiState<BacktestStatus>();

  const runBacktest = useCallback(
    (formData: BacktestFormData) => {
      return execute(() => ApiService.runBacktest(formData));
    },
    [execute]
  );

  return {
    result: data,
    loading,
    error,
    runBacktest,
    reset,
  };
}

/**
 * Hook for database information
 */
export function useDatabaseInfo() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tickersData, infoData] = await Promise.all([
        ApiService.getAvailableInstruments(),
        ApiService.getDatabaseInfo(),
      ]);
      setTickers(tickersData);
      setDatabaseInfo(infoData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch database information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tickers,
    databaseInfo,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for authentication state (now uses Redux)
 * @deprecated Use useAuth() context or Redux selectors directly
 */
export function useAuthState() {
  // Import useAuth at the top of the file when needed
  // This hook is now deprecated in favor of using useAuth() context
  // or directly using Redux selectors with useSelector

  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    logout: () => {},
    refreshAuthState: () => {}, // No longer needed with Redux
  };
}
