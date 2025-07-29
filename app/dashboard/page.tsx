"use client";

import { useState, useEffect } from "react";
import { BacktestForm } from "@/components/dashboard/backtest/form";
import { BacktestResultsView } from "@/components/dashboard/backtest/results";
import { backtestService } from "@/lib/backtest-service";
import { BacktestResults } from "@/types/backtest-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import CustomPopoverContent from "@/components/custom-popover-content";
import { cn } from "@/lib/utils";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function DashboardPage() {
  const [backtestId, setBacktestId] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] =
    useState<BacktestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);

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
    
    <PanelGroup autoSaveId="test" direction="horizontal" className="flex flex-row w-full gap-6 mt-6">
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-light">Glance</h1>
        <div className="flex flex-row gap-4 mt-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="bg-card border-2 border-card-border w-full h-32"
            >
              <CardContent className="flex items-center justify-center h-full"></CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-row gap-3 justify-end">
          <Popover
            open={isSchedulePopoverOpen}
            onOpenChange={setIsSchedulePopoverOpen}
          >
            <PopoverTrigger asChild>
              <div className="flex flex-row items-center justify-center gap-2 bg-button hover:bg-button/35 py-1.5 pl-3.5 pr-3 rounded-lg text-sm font-light">
                Schedule
                <ChevronDown
                  className={cn("w-5 h-5 transition-transform duration-300", {
                    "rotate-180": isSchedulePopoverOpen,
                  })}
                />
              </div>
            </PopoverTrigger>
            <CustomPopoverContent
              align="end"
              sideOffset={12}
              className="text-foreground"
            >
              <div className="flex flex-col">
                <p className="text-sm font-light">Schedule Options</p>
                <ul className="mt-2 space-y-1">
                  <li className="cursor-pointer hover:text-primary">Daily</li>
                  <li className="cursor-pointer hover:text-primary">Weekly</li>
                  <li className="cursor-pointer hover:text-primary">Monthly</li>
                </ul>
              </div>
            </CustomPopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center justify-center px-2.5 py-1.5 bg-button hover:bg-button/35 rounded-lg">
                <DotsHorizontalIcon className="w-5 h-5" />
              </div>
            </PopoverTrigger>
            <CustomPopoverContent
              align="end"
              sideOffset={12}
              className="text-foreground"
            >
              <div className="flex flex-col">Explainable AI settings</div>
            </CustomPopoverContent>
          </Popover>
          <div></div>
        </div>

        <Card className="bg-card border-2 border-card-border w-full">
          <CardContent>
            Explainable AI <sup>TM</sup>
          </CardContent>
        </Card>
      </div>
      {/* <div>
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
      )} */}
    </PanelGroup>
  );
}
