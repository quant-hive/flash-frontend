import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReturnData } from "@/types/backtest-service";
import React, { useEffect, useMemo, useState } from "react";

interface MonthlyReturnsHeatmapProps {
  returnsData: ReturnData[];
}

const MonthlyReturnsHeatmap = ({ returnsData }: MonthlyReturnsHeatmapProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate monthly returns from strategy returns data (memoized)
  const monthlyReturns = useMemo(() => {
    return calculateMonthlyReturns(returnsData);
  }, [returnsData]);

  // Process monthly returns for heatmap (memoized)
  const heatmapData = useMemo(() => {
    // Get the maximum year from the actual data
    const dataYears = monthlyReturns.map((r) => r.year);
    const maxYear =
      dataYears.length > 0 ? Math.max(...dataYears) : new Date().getFullYear();

    // Generate last 5 years starting from the max year in data
    const last5Years = Array.from({ length: 5 }, (_, i) => maxYear - i);

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    return last5Years.map((year) => ({
      year,
      months: months.map((_, monthIndex) => {
        const monthReturn = monthlyReturns.find(
          (r) => r.year === year && r.month === monthIndex + 1
        );
        return monthReturn ? monthReturn.return * 100 : null; // Convert to percentage
      }),
    }));
  }, [monthlyReturns]);

  // Function to get cell background color based on value
  const getCellColor = (value: number | null) => {
    if (value === null) return "transparent";

    if (value < -2) return "#FF462A95";
    if (value >= -2 && value < 0) return "#FFA62A95";
    if (value === 0) return "transparent";
    if (value > 1 && value <= 3) return "#F4FF2A95";
    if (value > 3 && value <= 6) return "#CDFF2A95";
    if (value > 6) return "#51FF2A95";

    return "transparent";
  };

  // Months for header
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // If no data is available
  if (returnsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] w-full">
        <p className="text-muted-foreground">
          No monthly returns data available
        </p>
      </div>
    );
  }

  // If not mounted yet (SSR), show skeleton
  if (!isMounted) {
    return (
      <div className="p-2 md:p-4 w-full">
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Heatmap rows */}
      {heatmapData.map((yearData) => (
        <div key={yearData.year} className="flex items-center">
          {/* Year label and Month cells row with border */}
          <div
            className="flex flex-1 h-16"
            style={{ border: "1px solid #4C4C4C" }}
          >
            {/* Year label */}
            <div
              className="w-16 flex items-center justify-center text-sm font-medium"
              style={{ color: "#484848" }}
            >
              {yearData.year}
            </div>

            {/* Month cells */}
            {yearData.months.map((value, monthIndex) => (
              <div
                key={monthIndex}
                className="flex-1 h-full flex items-center justify-center text-xs relative overflow-hidden min-w-0"
                style={{
                  background: `linear-gradient(135deg, #1B1B1D 0%, #212124 100%)`,
                  borderRight:
                    monthIndex < yearData.months.length - 1
                      ? "2px solid #000000"
                      : "none",
                  color: "#909092",
                }}
              >
                {/* Value text */}
                <p className="text-base relative z-10 text-[#909092]">
                  {value !== null ? (
                    <>
                      {value === 0 ? "0" : value.toFixed(2)}
                      <span className="text-[13px]">%</span>
                    </>
                  ) : (
                    "-"
                  )}
                </p>
                {/* Color overlay based on value */}
                <div
                  className="absolute h-6 w-full rounded-[50%] bottom-0 translate-y-1/2 blur-lg z-0"
                  style={{
                    backgroundColor: getCellColor(value),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer with months */}
      <div className="flex">
        {/* Empty space for year column */}
        <div className="w-16"></div>
        {/* Month headers */}
        {months.map((month) => (
          <div
            key={month}
            className="flex-1 text-center text-sm font-medium min-w-0"
            style={{ color: "#484848" }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-row">
        <legend className="flex flex-row gap-6 items-center">
          <div className="flex flex-row gap-2 items-center">
            <div className="size-4 bg-dark_red_icon_legend_gradient" />
            <span className="text-transparent bg-clip-text bg-dark_red_text_legend_gradient">
              Loss
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-4 bg-orange_icon_legend_gradient" />
            <span className="text-transparent bg-clip-text bg-orange_text_legend_gradient">
              Small Loss
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-4 bg-yellow_icon_legend_gradient" />
            <span className="text-transparent bg-clip-text bg-yellow_text_legend_gradient">
              Small Gain
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-4 bg-dark_green_icon_legend_gradient" />
            <span className="text-transparent bg-clip-text bg-dark_green_text_legend_gradient">
              Gain
            </span>
          </div>
        </legend>
      </div>
    </div>
  );
};

export default MonthlyReturnsHeatmap;

// Function to calculate monthly returns from daily returns data
function calculateMonthlyReturns(returnsData: ReturnData[]) {
  // Group returns by month
  const monthlyData: Record<
    string,
    {
      returns: number[];
      year: number;
      month: number;
    }
  > = {};

  // Early return for empty data
  if (!returnsData || returnsData.length === 0) {
    return [];
  }

  try {
    // Sort data by date
    const sortedData = [...returnsData].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Group by month
    sortedData.forEach((point) => {
      if (!point.date) return;

      try {
        const date = new Date(point.date);

        if (isNaN(date.getTime())) {
          console.error("Invalid date format:", point.date);
          return;
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-12
        const key = `${year}-${month}`;

        if (!monthlyData[key]) {
          monthlyData[key] = {
            returns: [],
            year,
            month,
          };
        }

        monthlyData[key].returns.push(point.strategy_return);
      } catch (err) {
        console.error("Error processing return data point:", err);
      }
    });

    // Calculate monthly return for each month
    return Object.entries(monthlyData).map(([key, data]) => {
      // Calculate cumulative return for the month
      const cumulativeReturn =
        data.returns.reduce((acc, ret) => {
          return acc * (1 + ret);
        }, 1) - 1;

      return {
        monthKey: key,
        year: data.year,
        month: data.month,
        return: cumulativeReturn,
      };
    });
  } catch (err) {
    console.error("Error calculating monthly returns:", err);
    return [];
  }
}
