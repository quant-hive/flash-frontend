"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowDownToLine,
  ExternalLink,
  Code,
  Download,
  TrendingUp,
  Activity,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

import { Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
  RadarController,
} from "chart.js";
import dynamic from "next/dynamic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Papa from "papaparse";
import { TradeReport } from "../trade-report";
import { DrawdownChartFromReturns } from "../drawdown-chart-from-returns";
import ReactMarkdown from "react-markdown";
import {
  BacktestResults,
  BenchmarkReturns,
  ReturnData,
  Trade,
} from "@/types/backtest-service";
import { backtestService, databaseService } from "@/lib/backtest-service";
import { ReturnsComparisonChart } from "../returns-comparison-chart";
import { MonthlyReturnsHeatmap } from "../monthly-returns-heatmap";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dynamically import ApexCharts to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Add chart options
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 10,
      },
    },
    y: {
      beginAtZero: false,
    },
  },
};

const drawdownChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 10,
      },
    },
    y: {
      beginAtZero: false,
      reverse: true,
    },
  },
};

interface BacktestResultsProps {
  backtestId: string;
  onClose: () => void;
  backtestResults: BacktestResults & { name?: string };
}

interface TradeData {
  ticker: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  return_pct: number;
}

interface MonthlyReturn {
  month: string;
  year: number;
  return: number;
}

interface BacktestCsvData {
  equityCurve: { date: string; equity: number }[];
  drawdowns: { date: string; drawdown: number }[];
  trades: TradeData[];
  monthlyReturns: MonthlyReturn[];
}

export function BacktestResultsView({
  backtestId,
  onClose,
  backtestResults,
}: BacktestResultsProps) {
  const [results, setResults] = useState<BacktestResults>(backtestResults);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkReturns | null>(
    null
  );
  const [csvData, setCsvData] = useState<BacktestCsvData | null>(null);
  const [tradeData, setTradeData] = useState<Trade[]>([]);
  const [returnsData, setReturnsData] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiRetries, setApiRetries] = useState(0);
  const MAX_RETRIES = 3;

  // Fetch benchmark data and CSV data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get start and end dates from the backtest results if available
        const startDate = results.start_date || "2020-01-01";
        const endDate = results.end_date || "2023-01-01";

        // Fetch benchmark returns (optional/legacy)
        const benchmark = await databaseService.getBenchmarkReturns(
          startDate,
          endDate
        );
        setBenchmarkData(benchmark);

        // Fetch trade reports with retry logic
        await fetchTradeData(backtestId);

        // Fetch strategy vs benchmark returns with retry logic
        await fetchReturnsData(backtestId);

        // Fetch and parse CSV data (legacy approach)
        await fetchCsvData(backtestId);
      } catch (err: any) {
        console.error("Error fetching additional data:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to fetch backtest data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backtestId, results]);

  // Fetch trade data with retry logic
  const fetchTradeData = async (id: string) => {
    try {
      console.log("Fetching trade reports for:", id);
      const trades = await backtestService.getTradeReports(id);
      console.log("Received trade data:", trades);
      if (Array.isArray(trades) && trades.length > 0) {
        setTradeData(trades);
      } else {
        console.warn("Trade data is empty or not in expected format");
      }
    } catch (tradeErr: any) {
      console.error("Error fetching trade data:", tradeErr);
      // Retry logic for API calls
      if (apiRetries < MAX_RETRIES) {
        setApiRetries((prev) => prev + 1);
        console.log(
          `Retrying trade data fetch (${apiRetries + 1}/${MAX_RETRIES})...`
        );
        setTimeout(() => fetchTradeData(id), 2000 * (apiRetries + 1));
      }
    }
  };

  // Fetch returns data with retry logic
  const fetchReturnsData = async (id: string) => {
    try {
      const returns = await backtestService.getReturnsData(id);
      if (Array.isArray(returns) && returns.length > 0) {
        setReturnsData(returns);
      } else {
        console.warn("Returns data is empty or not in expected format");
      }
    } catch (returnsErr: any) {
      console.error("Error fetching returns data:", returnsErr);
      // Retry logic for API calls
      if (apiRetries < MAX_RETRIES) {
        setApiRetries((prev) => prev + 1);
        console.log(
          `Retrying returns data fetch (${apiRetries + 1}/${MAX_RETRIES})...`
        );
        setTimeout(() => fetchReturnsData(id), 2000 * (apiRetries + 1));
      }
    }
  };

  // Fetch and parse CSV data
  const fetchCsvData = async (id: string) => {
    try {
      const csvUrl = backtestService.getBacktestReportUrl(id, "csv");
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse CSV data
      const parsedData = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
      });

      if (parsedData.data && parsedData.data.length > 0) {
        // Process CSV data for charts
        const equityCurve = parsedData.data
          .filter((row: any) => row.date && row.equity)
          .map((row: any) => ({
            date: row.date,
            equity: parseFloat(row.equity),
          }));

        const drawdowns = parsedData.data
          .filter((row: any) => row.date && row.drawdown !== undefined)
          .map((row: any) => ({
            date: row.date,
            drawdown: parseFloat(row.drawdown),
          }));

        const trades = parsedData.data
          .filter((row: any) => row.ticker && row.entry_date && row.exit_date)
          .map((row: any) => ({
            ticker: row.ticker,
            entry_date: row.entry_date,
            exit_date: row.exit_date,
            entry_price: parseFloat(row.entry_price),
            exit_price: parseFloat(row.exit_price),
            pnl: parseFloat(row.pnl),
            return_pct: parseFloat(row.return_pct),
          }));

        // Process monthly returns
        const monthlyReturns = parsedData.data
          .filter((row: any) => row.month && row.return !== undefined)
          .map((row: any) => {
            const [year, month] = row.month.split("-");
            return {
              month: month,
              year: parseInt(year),
              return: parseFloat(row.return),
            };
          });

        setCsvData({ equityCurve, drawdowns, trades, monthlyReturns });
      }
    } catch (err) {
      console.error("Error fetching CSV data:", err);
    }
  };

  const downloadReport = (format: "csv" | "html") => {
    const url = backtestService.getBacktestReportUrl(backtestId, format);
    window.open(url, "_blank");
  };

  const openDebugView = () => {
    const url = backtestService.getBacktestDebugUrl(backtestId);
    window.open(url, "_blank");
  };

  // Prepare data for equity curve chart
  const prepareEquityCurveData = () => {
    if (!csvData?.equityCurve || !benchmarkData) return null;

    // Filter benchmark data to match the backtest period
    const backtestDates = new Set(
      csvData.equityCurve.map((point) => point.date)
    );
    const filteredBenchmarkDates = benchmarkData.returns.dates.filter((date) =>
      backtestDates.has(date)
    );
    const filteredBenchmarkValues = filteredBenchmarkDates.map(
      (date, index) => {
        return benchmarkData.returns.values[
          benchmarkData.returns.dates.indexOf(date)
        ];
      }
    );

    // Normalize benchmark values to start at the same point as the backtest
    const initialBacktestValue = csvData.equityCurve[0]?.equity || 1;
    const initialBenchmarkValue = filteredBenchmarkValues[0] || 1;
    const normalizedBenchmarkValues = filteredBenchmarkValues.map(
      (value) => (value / initialBenchmarkValue) * initialBacktestValue
    );

    return {
      labels: csvData.equityCurve.map((point) => point.date),
      datasets: [
        {
          label: "Strategy",
          data: csvData.equityCurve.map((point) => point.equity),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Benchmark",
          data: normalizedBenchmarkValues,
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          tension: 0.1,
          fill: false,
        },
      ],
    };
  };

  // Prepare data for drawdown chart
  const prepareDrawdownData = () => {
    if (!csvData?.drawdowns) return null;

    return {
      labels: csvData.drawdowns.map((point) => point.date),
      datasets: [
        {
          label: "Drawdown",
          data: csvData.drawdowns.map((point) => point.drawdown),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  // Prepare data for radar chart (spider plot)
  const prepareSpiderData = () => {
    if (!results) return null;

    // Example benchmark metrics for comparison
    // In a real implementation, you'd get these from the API
    const benchmarkMetrics = {
      sharpe: 1.0,
      sortino: 1.2,
      alpha: 0,
      beta: 1.0,
      maxDrawdown: 15,
    };

    return {
      labels: ["Sharpe", "Sortino", "Alpha", "Beta", "Max Drawdown"],
      datasets: [
        {
          label: "Strategy",
          data: [
            results.metrics.sharpe,
            results.metrics.sortino,
            results.metrics.alpha,
            results.metrics.beta,
            Math.min(results.metrics.max_drawdown, 40), // Cap at 40% for visualization
          ],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgb(59, 130, 246)",
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(59, 130, 246)",
        },
        {
          label: "Benchmark",
          data: [
            benchmarkMetrics.sharpe,
            benchmarkMetrics.sortino,
            benchmarkMetrics.alpha,
            benchmarkMetrics.beta,
            benchmarkMetrics.maxDrawdown,
          ],
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          borderColor: "rgb(249, 115, 22)",
          pointBackgroundColor: "rgb(249, 115, 22)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(249, 115, 22)",
        },
      ],
    };
  };

  // Prepare data for monthly returns heatmap
  const prepareMonthlyReturnsHeatmap = () => {
    if (!csvData?.monthlyReturns) return null;

    // Process monthly returns for heatmap
    const years = Array.from(
      new Set(csvData.monthlyReturns.map((r) => r.year))
    ).sort();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const series = years.map((year) => {
      return {
        name: year.toString(),
        data: months.map((_, monthIndex) => {
          const monthReturn = csvData.monthlyReturns.find(
            (r) => r.year === year && parseInt(r.month) === monthIndex + 1
          );
          return monthReturn ? monthReturn.return : null;
        }),
      };
    });

    return {
      options: {
        chart: {
          type: "heatmap",
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val ? val.toFixed(2) + "%" : "0%";
          },
        },
        colors: ["#008FFB"],
        title: {
          text: "Monthly Returns (%)",
        },
        xaxis: {
          categories: months,
        },
        plotOptions: {
          heatmap: {
            colorScale: {
              ranges: [
                {
                  from: -20,
                  to: -5,
                  color: "#FF4560",
                  name: "loss",
                },
                {
                  from: -5,
                  to: 0,
                  color: "#FEB019",
                  name: "small loss",
                },
                {
                  from: 0,
                  to: 5,
                  color: "#00E396",
                  name: "small gain",
                },
                {
                  from: 5,
                  to: 20,
                  color: "#008FFB",
                  name: "gain",
                },
              ],
            },
          },
        },
      },
      series,
    };
  };

  // Render results
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-background rounded-lg">
        <div className="flex flex-col">
          <div className="sticky top-0 flex justify-between items-center bg-background p-4 border-b z-10">
            <div>
              <h2 className="text-2xl font-semibold">
                Backtest Results: {(results as any).name || backtestId}
              </h2>
              {(results as any).created_at && (
                <p className="text-sm text-muted-foreground">
                  Created on{" "}
                  {new Date((results as any).created_at).toLocaleString()}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center">
              <div className="flex items-center space-x-4 mb-4">
                <Spinner />
                <p>Loading backtest data...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="p-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="trades">Trades</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="code">Strategy Code</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <MetricCard
                      title="Total Return"
                      value={results.metrics.total_return}
                      format="percent"
                      isNegative={results.metrics.total_return < 0}
                    />
                    <MetricCard
                      title="Annual Return"
                      value={results.metrics.annual_return}
                      format="percent"
                      isNegative={results.metrics.annual_return < 0}
                    />
                    <MetricCard
                      title="Sharpe Ratio"
                      value={results.metrics.sharpe}
                      format="number"
                      isNegative={results.metrics.sharpe < 0}
                    />
                    <MetricCard
                      title="Alpha"
                      value={results.metrics.alpha}
                      format="percent"
                      isNegative={results.metrics.alpha < 0}
                      description="(annualized)"
                    />
                    <MetricCard
                      title="Max Drawdown"
                      value={results.metrics.max_drawdown}
                      format="percent"
                      isNegative={true}
                      forceRed={true}
                    />
                    <MetricCard
                      title="Win Rate"
                      value={results.metrics.win_rate}
                      format="percent"
                    />
                  </div>

                  {returnsData.length > 0 ? (
                    <div className="space-y-4">
                      <ReturnsComparisonChart data={returnsData} />
                      <DrawdownChartFromReturns data={returnsData} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Legacy charts based on CSV data */}
                      {prepareEquityCurveData() && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">
                              Equity Curve
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <Line
                                data={prepareEquityCurveData()!}
                                options={chartOptions}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {prepareDrawdownData() && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Drawdown</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-80">
                              <Line
                                data={prepareDrawdownData()!}
                                options={drawdownChartOptions}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">
                          AI Strategy Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="mb-4">
                            <h3 className="text-lg font-medium">
                              Strategy Analysis
                            </h3>
                            <div className="whitespace-pre-line">
                              <ReactMarkdown>{results.insights}</ReactMarkdown>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">
                              Suggestions for Improvement
                            </h3>
                            <div className="whitespace-pre-line">
                              <ReactMarkdown>
                                {results.improvements}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="trades">
                  {loading ? (
                    <div className="p-8 flex flex-col items-center">
                      <Spinner />
                      <p className="mt-4">Loading trade data...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : tradeData && tradeData.length > 0 ? (
                    <TradeReport trades={tradeData} />
                  ) : (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No trade data available</AlertTitle>
                      <AlertDescription>
                        No trades were executed during this backtest or trade
                        data could not be retrieved. Try refreshing or check the
                        API connection.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Performance Metrics
                      </h3>
                      <Card>
                        <CardContent className="p-4">
                          <Table>
                            <TableBody>
                              {Object.entries(results.metrics).map(
                                ([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell className="font-medium capitalize">
                                      {key.replace(/_/g, " ")}
                                    </TableCell>
                                    <TableCell>
                                      {typeof value === "number"
                                        ? key.includes("return") ||
                                          key.includes("drawdown") ||
                                          key.includes("rate")
                                          ? `${value.toFixed(2)}%`
                                          : key === "alpha"
                                          ? `${value.toFixed(2)}% (annualized)`
                                          : key === "beta"
                                          ? value.toFixed(2) + " vs benchmark"
                                          : value.toFixed(4)
                                        : String(value)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Monthly Returns</h3>
                      <div className="h-96 overflow-hidden">
                        {loading ? (
                          <Skeleton className="w-full h-full" />
                        ) : returnsData.length > 0 ? (
                          <MonthlyReturnsHeatmap returnsData={returnsData} />
                        ) : (
                          prepareMonthlyReturnsHeatmap() && (
                            <div id="monthly-returns-chart">
                              <ReactApexChart
                                options={{
                                  chart: {
                                    type: "heatmap" as "heatmap",
                                    toolbar: {
                                      show: false,
                                    },
                                  },
                                  dataLabels: {
                                    enabled: true,
                                    formatter: function (val: number) {
                                      return val ? val.toFixed(2) + "%" : "0%";
                                    },
                                  },
                                  colors: ["#008FFB"],
                                  title: {
                                    text: "Monthly Returns (%)",
                                  },
                                  xaxis: {
                                    categories: [
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ],
                                  },
                                  plotOptions: {
                                    heatmap: {
                                      colorScale: {
                                        ranges: [
                                          {
                                            from: -20,
                                            to: -5,
                                            color: "#FF4560",
                                            name: "loss",
                                          },
                                          {
                                            from: -5,
                                            to: 0,
                                            color: "#FEB019",
                                            name: "small loss",
                                          },
                                          {
                                            from: 0,
                                            to: 5,
                                            color: "#00E396",
                                            name: "small gain",
                                          },
                                          {
                                            from: 5,
                                            to: 20,
                                            color: "#008FFB",
                                            name: "gain",
                                          },
                                        ],
                                      },
                                    },
                                  },
                                }}
                                series={prepareMonthlyReturnsHeatmap()!.series}
                                type="heatmap"
                                height="100%"
                                width="100%"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="py-4">
                  <h3 className="text-lg font-medium mb-4">Strategy Code</h3>
                  <div className="p-4 bg-muted rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs">
                      {results.strategy_code || "No strategy code available"}
                    </pre>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={openDebugView}>
                      Debug View <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  format: "percent" | "number";
  isNegative?: boolean;
  forceRed?: boolean;
  description?: string;
}

function MetricCard({
  title,
  value,
  format,
  isNegative = false,
  forceRed = false,
  description,
}: MetricCardProps) {
  const formattedValue =
    format === "percent" ? `${value.toFixed(2)}%` : value.toFixed(2);

  // Determine color based on value and whether it's a metric where negative is bad
  const getTextColorClass = () => {
    if (forceRed) return "text-red-500";

    // Some metrics like drawdown are negative by nature
    const adjustedValue = isNegative ? -value : value;

    if (adjustedValue > 0) return "text-green-500";
    if (adjustedValue < 0) return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div className="bg-muted p-3 rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">
        {title}{" "}
        {description && (
          <span className="text-xs text-muted-foreground">({description})</span>
        )}
      </h3>
      <p className={`text-2xl font-bold ${getTextColorClass()}`}>
        {formattedValue}
      </p>
    </div>
  );
}
