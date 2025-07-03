"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowRightFromLine } from "lucide-react";
import { backtestService } from "@/lib/backtest-service";
import { BacktestStatus } from "@/types/backtest-service";
import { BacktestComparison } from "@/components/backtest-comparison";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/dashboard/compare/loading-state";
import { ErrorState } from "@/components/dashboard/compare/error-state";
// import { /* types here if needed */ } from "@/types/dashboard-compare"

export default function ComparePage() {
  const [backtests, setBacktests] = useState<BacktestStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBacktests, setSelectedBacktests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Process URL parameters for pre-selected backtest IDs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get("ids");

    if (idsParam) {
      // Handle multiple IDs separated by commas
      const ids = idsParam.split(",").slice(0, 5); // Limit to 5 backtests
      setSelectedBacktests(ids);
      if (ids.length > 0) {
        setShowComparison(true);
      }
    }
  }, []);

  const fetchBacktests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await backtestService.getUserBacktests();

      // Filter out backtests that are not completed
      const completedBacktests = response.filter(
        (backtest) => backtest.status === "completed"
      );
      setBacktests(completedBacktests);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch backtests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBacktests();
    }
  }, [isAuthenticated]);

  const toggleBacktestSelection = (id: string) => {
    setSelectedBacktests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        // Max selection of 5 backtests
        if (prev.length < 5) {
          return [...prev, id];
        }
        return prev;
      }
    });
  };

  const filteredBacktests = backtests.filter((backtest) =>
    backtest.backtest_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchBacktests} />;
  }

  if (showComparison && selectedBacktests.length > 0) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Backtest Comparison
          </h1>
          <Button variant="outline" onClick={() => setShowComparison(false)}>
            Back to Selection
          </Button>
        </div>

        <BacktestComparison backtestIds={selectedBacktests} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Compare Backtests</h1>

      {backtests.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <h3 className="text-lg font-medium">
                No completed backtests found
              </h3>
              <p className="text-muted-foreground mt-2">
                Run some backtests from the dashboard to compare them here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Backtests to Compare</CardTitle>
              <CardDescription>
                Select up to 5 backtests to compare their performance metrics
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

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Backtest ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBacktests.map((backtest) => (
                        <TableRow key={backtest.backtest_id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBacktests.includes(
                                backtest.backtest_id
                              )}
                              onCheckedChange={() =>
                                toggleBacktestSelection(backtest.backtest_id)
                              }
                              disabled={
                                selectedBacktests.length >= 5 &&
                                !selectedBacktests.includes(
                                  backtest.backtest_id
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {backtest.backtest_id}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {backtest.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBacktests([backtest.backtest_id]);
                                setShowComparison(true);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedBacktests.length} of 5 backtests selected
                  </p>
                  <Button
                    onClick={() => setShowComparison(true)}
                    disabled={selectedBacktests.length === 0}
                  >
                    Compare Selected
                    <ArrowRightFromLine className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
