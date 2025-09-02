"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { backtestService } from "@/lib/backtest-service";
import { LoadingState } from "@/components/dashboard/backtest/loading-state";
import { ErrorState } from "@/components/dashboard/backtest/error-state";
import { BacktestPageProps } from "@/types/dashboard-backtest";
import BacktestResultsView from "@/components/dashboard/backtest/new-results";
import { BacktestResults } from "@/types/backtest-service";

export default function BacktestPage({ params }: BacktestPageProps) {
  // Since this is a client component, we can use the `use` hook to resolve the params.
  // This allows us to access the backtest ID directly in the component.
  const resolvedParams = use(params);

  const [backtestResults, setBacktestResults] =
    useState<BacktestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBacktestResults = async () => {
      try {
        setLoading(true);
        const results = await backtestService.getBacktestResults(
          resolvedParams.id
        );
        setBacktestResults(results);
      } catch (err: any) {
        console.error("Error fetching backtest results:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to fetch backtest results"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBacktestResults();
  }, [resolvedParams.id]);

  const handleClose = () => {
    router.push("/dashboard/history");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onClose={handleClose} />;
  }

  if (backtestResults) {
    return (
      <BacktestResultsView
        backtestId={resolvedParams.id}
        backtestResults={backtestResults}
      />
    );
  }
}
