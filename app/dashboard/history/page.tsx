"use client";

import { useState } from "react";
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
import { ApiService } from "@/lib/api-service";
import { useUserBacktests } from "@/hooks/use-api";
import { BacktestStatus } from "@/types/backtest-service";
import { useAuth } from "@/contexts/auth-context";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/dashboard/history/loading-state";
import { ErrorState } from "@/components/dashboard/history/error-state";
import { formatDate } from "@/lib/utils";
// import { /* types here if needed */ } from "@/types/dashboard-history"

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [progressValues, setProgressValues] = useState<Record<string, number>>(
    {}
  );
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Use the new hook for managing backtests
  const { backtests, loading, error, refetch, deleteBacktest } =
    useUserBacktests();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this backtest?")) {
      try {
        await deleteBacktest(id);
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
    window.open(ApiService.getBacktestReportUrl(id, format), "_blank");
  };

  const filteredBacktests = (backtests || []).filter(
    (backtest) =>
      backtest.backtest_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (backtest.name &&
        backtest.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && (!backtests || backtests.length === 0)) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
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

            {!backtests || backtests.length === 0 ? (
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
