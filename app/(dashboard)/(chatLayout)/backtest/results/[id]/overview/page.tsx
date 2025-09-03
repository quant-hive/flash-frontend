"use client";

import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/dashboard/backtest/loading-state";
import { ErrorState } from "@/components/dashboard/backtest/error-state";
import { BacktestPageProps } from "@/types/dashboard-backtest";
import BacktestResultsView from "@/components/dashboard/backtest/new-results";
import { useBacktestResults } from "@/context/backtest-results-context";

export default function BacktestPage({}: BacktestPageProps) {
  const router = useRouter();

  const { loading, error, results, backtestId } = useBacktestResults();

  const handleClose = () => {
    router.push("/dashboard/history");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onClose={handleClose} />;
  }

  if (results) {
    return (
      <BacktestResultsView backtestId={backtestId} backtestResults={results} />
    );
  }

  return null;
}
