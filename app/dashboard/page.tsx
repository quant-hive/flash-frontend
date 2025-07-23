"use client";

import { useState, useEffect } from "react";
import { BacktestForm } from "@/components/dashboard/backtest/form";
import { BacktestResultsView } from "@/components/dashboard/backtest/results";
import { backtestService } from "@/lib/backtest-service";
import { BacktestResults } from "@/types/backtest-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

export default function DashboardPage() {
  const [backtestId, setBacktestId] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] =
    useState<BacktestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleBacktestSubmitted = async (id: string) => {
    setBacktestId(id);
    setIsLoading(true);
    setError(null);

    try {
      // Poll for backtest completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await backtestService.getBacktestStatus(id);

          if (status.status === "completed") {
            clearInterval(pollInterval);
            const results = await backtestService.getBacktestResults(id);
            setBacktestResults(results);
            setIsLoading(false);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setError(`Backtest failed: ${status.message}`);
            setIsLoading(false);
          }
        } catch (err: any) {
          clearInterval(pollInterval);

          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to get backtest status"
          );
          setIsLoading(false);
        }
      }, 3000); // Poll every 3 seconds

      // Cleanup interval on component unmount
      return () => clearInterval(pollInterval);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to process backtest"
      );
      setIsLoading(false);
    }
  };

  const handleCloseResults = () => {
    setBacktestResults(null);
    setBacktestId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Flash</h1>
        <p className="text-muted-foreground">
          Test your investment ideas in minutes
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!backtestResults ? (
        <BacktestForm onBacktestSubmitted={handleBacktestSubmitted} />
      ) : (
        <BacktestResultsView
          backtestId={backtestId!}
          onClose={handleCloseResults}
          backtestResults={backtestResults}
        />
      )}
    </div>
  );
}
