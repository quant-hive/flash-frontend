"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Download, Trash2, GitCompare } from "lucide-react";
import { useRouter } from "next/navigation";
import { backtestService } from "@/lib/backtest-service";
import { BacktestStatus } from "@/types/backtest-service";
import { useAuth } from "@/contexts/auth-context";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/dashboard/history/loading-state";
import { ErrorState } from "@/components/dashboard/history/error-state";
// import { /* types here if needed */ } from "@/types/dashboard-history"

export default function HistoryPage() {
  const [backtests, setBacktests] = useState<BacktestStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [runningBacktests, setRunningBacktests] = useState<Set<string>>(
    new Set()
  );
  const [progressValues, setProgressValues] = useState<Record<string, number>>(
    {}
  );
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const fetchBacktests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await backtestService.getUserBacktests();
      setBacktests(response);

      // Track running backtests
      const running = new Set<string>();
      response.forEach((backtest) => {
        if (backtest.status === "running" || backtest.status === "pending") {
          running.add(backtest.backtest_id);
          // Initialize progress for new running backtests
          if (!progressValues[backtest.backtest_id]) {
            setProgressValues((prev) => ({
              ...prev,
              [backtest.backtest_id]: 0,
            }));
          }
        }
      });
      setRunningBacktests(running);
    } catch (err: any) {
      console.error("Error fetching backtests:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch backtests"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchBacktests();
    }
  }, [isAuthenticated]);

  // Poll for updates on running backtests
  useEffect(() => {
    if (runningBacktests.size === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        // Only poll if there are running backtests
        if (runningBacktests.size > 0) {
          // Get fresh status
          const response = await backtestService.getUserBacktests();

          // Update progresses
          const newProgressValues = { ...progressValues };
          let changed = false;

          response.forEach((backtest) => {
            if (runningBacktests.has(backtest.backtest_id)) {
              // If status changed, update it
              if (
                backtest.status !== "running" &&
                backtest.status !== "pending"
              ) {
                runningBacktests.delete(backtest.backtest_id);
                changed = true;
              } else {
                // Simulate progress advancement for running backtests
                newProgressValues[backtest.backtest_id] = Math.min(
                  newProgressValues[backtest.backtest_id] + Math.random() * 5,
                  95 // Cap at 95% until actually complete
                );
                changed = true;
              }
            }
          });

          if (changed) {
            setProgressValues(newProgressValues);
            setRunningBacktests(new Set(runningBacktests));

            // If all are done, update the full list
            if (runningBacktests.size === 0) {
              setBacktests(response);
            }
          }
        }
      } catch (error) {
        console.error("Error polling backtest status:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [runningBacktests, progressValues]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this backtest?")) {
      try {
        await backtestService.deleteBacktest(id);
        // Refresh the list
        fetchBacktests();
      } catch (error) {
        console.error("Error deleting backtest:", error);
        alert("Failed to delete backtest");
      }
    }
  };

  const handleViewResults = (id: string) => {
    router.push(`/dashboard/backtest/${id}`);
  };

  const handleCompare = (id: string) => {
    router.push(`/dashboard/compare?ids=${id}`);
  };

  const handleDownload = (id: string, format: "csv" | "html" = "csv") => {
    window.open(backtestService.getBacktestReportUrl(id, format), "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredBacktests = backtests.filter(
    (backtest) =>
      backtest.backtest_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (backtest.name &&
        backtest.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && backtests.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchBacktests} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Backtest History</h1>
        <Button onClick={() => router.push("/dashboard/compare")}>
          <GitCompare className="mr-2 h-4 w-4" />
          Compare Backtests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Backtests</CardTitle>
          <CardDescription>
            View and manage your previous backtest runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search backtests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {backtests.length === 0 ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium">No backtests found</h3>
                <p className="text-muted-foreground mt-2">
                  Run your first backtest from the dashboard.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backtest Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBacktests.map((backtest) => (
                      <TableRow key={backtest.backtest_id}>
                        <TableCell className="font-medium">
                          {backtest.name || backtest.backtest_id}
                        </TableCell>
                        <TableCell>{formatDate(backtest.created_at)}</TableCell>
                        <TableCell>
                          {backtest.status === "running" ||
                          backtest.status === "pending" ? (
                            <div className="space-y-2 w-24">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {backtest.status}
                              </span>
                              <Progress
                                value={
                                  progressValues[backtest.backtest_id] || 0
                                }
                                className="h-2"
                              />
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                backtest.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : backtest.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {backtest.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {backtest.message}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {backtest.status === "completed" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleViewResults(backtest.backtest_id)
                                  }
                                  title="View Results"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleCompare(backtest.backtest_id)
                                  }
                                  title="Compare"
                                >
                                  <GitCompare className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDownload(backtest.backtest_id)
                                  }
                                  title="Download CSV"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(backtest.backtest_id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
