import { backtestService, databaseService } from "@/lib/backtest-service";
import type {
  BacktestResults,
  BenchmarkReturns,
  ReturnData,
  Trade,
} from "@/types/backtest-service";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import ResultMetrics from "../../result-metrics";
import { ReturnsComparisonChart } from "../new-returns-comparison-chart";
import { DrawdownChartFromReturns } from "../new-drawdown-chrt-from-returns";

interface BacktestResultsProps {
  backtestId: string;
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

const BacktestResultsView = ({
  backtestId,
  backtestResults,
}: BacktestResultsProps) => {
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

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      <ResultMetrics metrics={results.metrics} />

      <div className="flex flex-row gap-4 mt-4">
        <ReturnsComparisonChart data={returnsData} />
        <DrawdownChartFromReturns data={returnsData} />
      </div>
    </div>
  );
};

export default BacktestResultsView;
