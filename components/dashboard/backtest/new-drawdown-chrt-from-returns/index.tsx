"use client";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnData } from "@/types/backtest-service";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { PlusIcon } from "lucide-react";
import CustomPopoverContent from "@/components/custom-popover-content";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import GraphSettings from "../graph-settings";
import { useEffect, useState } from "react";
import CustomYearMonthRange from "@/components/custom-year-month-range";

interface DrawdownChartFromReturnsProps {
  data: ReturnData[];
}

export function DrawdownChartFromReturns({
  data,
}: DrawdownChartFromReturnsProps) {
  const { theme } = useTheme();

  // Month-year values: YYYY-MM
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minMonth, setMinMonth] = useState<string>("");
  const [maxMonth, setMaxMonth] = useState<string>("");

  // Local state that powers the chart (starts with full data)
  const [visibleData, setVisibleData] = useState<ReturnData[]>(data);

  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showGridLines, setShowGridLines] = useState<boolean>(false);
  /* const [gridStyle, setGridStyle] = useState<"dotted" | "dashed">("dashed"); */

  // Helpers
  const toMonthValue = (d: Date | string): string => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${y}-${m}`; // YYYY-MM
  };

  const monthStart = (ym: string): Date => {
    // ym: YYYY-MM
    const [y, m] = ym.split("-").map((v) => parseInt(v, 10));
    return new Date(y, (m || 1) - 1, 1, 0, 0, 0, 0);
  };

  const monthEnd = (ym: string): Date => {
    const [y, m] = ym.split("-").map((v) => parseInt(v, 10));
    // day 0 of next month gives last day of this month
    return new Date(y, m || 1, 0, 23, 59, 59, 999);
  };

  // Keep visibleData and month bounds in sync if the prop changes
  useEffect(() => {
    setVisibleData(data);

    if (data.length > 0) {
      // Compute min/max dates from dataset
      let minTs = Infinity;
      let maxTs = -Infinity;
      for (const d of data) {
        const ts = new Date(d.date).getTime();
        if (!isNaN(ts)) {
          if (ts < minTs) minTs = ts;
          if (ts > maxTs) maxTs = ts;
        }
      }
      if (isFinite(minTs) && isFinite(maxTs)) {
        const minV = toMonthValue(new Date(minTs));
        const maxV = toMonthValue(new Date(maxTs));
        setMinMonth(minV);
        setMaxMonth(maxV);
        setStartDate(minV);
        setEndDate(maxV);
      }
    } else {
      setMinMonth("");
      setMaxMonth("");
      setStartDate("");
      setEndDate("");
    }
  }, [data]);

  // Filter function using month-year range
  const filterDate = (
    start: Date | string,
    end: Date | string
  ): ReturnData[] => {
    // Normalize to YYYY-MM
    const startMonth =
      typeof start === "string" && /^\d{4}-\d{2}$/.test(start)
        ? start
        : toMonthValue(start);
    const endMonth =
      typeof end === "string" && /^\d{4}-\d{2}$/.test(end)
        ? end
        : toMonthValue(end);

    if (!startMonth || !endMonth) {
      console.warn("filterDate: invalid start/end month", { start, end });
      return visibleData;
    }

    // Convert to time range [startOfMonth, endOfMonth]
    const startTs = monthStart(startMonth).getTime();
    const endTs = monthEnd(endMonth).getTime();

    // Support reversed ranges
    const from = Math.min(startTs, endTs);
    const to = Math.max(startTs, endTs);

    // Inclusive filtering
    const filtered = data.filter((d) => {
      const ts = new Date(d.date).getTime();
      return ts >= from && ts <= to;
    });

    setVisibleData(filtered);
    return filtered;
  };

  // Re-filter when dates change
  useEffect(() => {
    if (startDate && endDate) {
      filterDate(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Calculate drawdown from visible (filtered) returns
  const drawdownData = calculateDrawdown(visibleData);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg bg-blue_accent_gradient p-[2px] rounded-xl">
          <CardContent className="bg-[#222222] rounded-[10px] py-3 px-4">
            <p>{label}</p>
            <p className="text-sm">
              <span className="text-[#E44245]">●</span> Drawdown:{" "}
              {(payload[0].value * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-light">Drawdown</h1>
        <div className="flex flex-row items-center gap-2 h-full">
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center justify-center px-3 py-1.5 h-full bg-button hover:bg-button/35 rounded-lg">
                <PlusIcon className="w-4 h-4" />
              </div>
            </PopoverTrigger>
            <CustomPopoverContent
              align="end"
              sideOffset={12}
              className="text-foreground"
            >
              <div className="flex flex-col">Strategy v Benchmark</div>
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
              <GraphSettings
                showLabels={showLabels}
                showGridLines={showGridLines}
                /* gridStyle={gridStyle || "dotted"} */
                onShowLabel={setShowLabels}
                onShowGridLines={setShowGridLines}
                /* onChangeGridStyle={setGridStyle} */
              />
            </CustomPopoverContent>
          </Popover>
        </div>
      </div>
      <Card className="w-full mt-3 bg-[#1B1B1D] border-2 border-[#2A2A2C]">
        <CardContent className="p-6 pt-4">
          <div className="flex flex-row justify-between items-center mb-2">
            <legend className="flex flex-row gap-6 items-center">
              <div className="flex flex-row gap-2 items-center">
                <div className="size-4 bg-red_icon_legend_gradient" />
                <span className="text-transparent bg-clip-text bg-red_text_legend_gradient">
                  Drawdown
                </span>
              </div>
            </legend>

            <CustomYearMonthRange
              startDate={startDate}
              endDate={endDate}
              minMonth={minMonth}
              maxMonth={maxMonth}
              onStartDateChange={(val) => setStartDate(val)}
              onEndDateChange={(val) => setEndDate(val)}
            />
          </div>
          <div className="h-80 mt-4 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={drawdownData}
                margin={{ top: 0, right: 20, left: 0, bottom: 16 }}
              >
                {showGridLines && (
                  <CartesianGrid stroke="#2F2F2F" strokeDasharray="3 3" />
                )}
                <XAxis
                  dataKey="date"
                  stroke="#909092"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const dateObj = new Date(value);
                    return `${dateObj.getMonth() + 1}/${dateObj
                      .getFullYear()
                      .toString()
                      .substr(-2)}`;
                  }}
                  label={
                    showLabels
                      ? {
                          value: "Date (MM/YY)",
                          position: "insideBottom",
                          offset: -12,
                        }
                      : undefined
                  }
                />
                <YAxis
                  stroke="#909092"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  domain={[0, "dataMax + 0.05"]}
                  label={
                    showLabels
                      ? {
                          angle: -90,
                          position: "insideLeft",
                          value: "Drawdown (%)",
                        }
                      : undefined
                  }
                  reversed // Reverse axis to show drawdown as negative from top
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#E44245"
                  fill="rgba(239, 68, 68, 0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Function to calculate drawdown from returns
function calculateDrawdown(
  data: ReturnData[]
): { date: string; drawdown: number }[] {
  // Calculate cumulative returns
  let cumulativeReturn = 1;
  let peakValue = 1;

  return data.map((point) => {
    // Update cumulative return
    cumulativeReturn = cumulativeReturn * (1 + point.strategy_return);

    // Update peak value if we have a new high
    peakValue = Math.max(peakValue, cumulativeReturn);

    // Calculate drawdown as the percentage decline from the peak
    const drawdown = cumulativeReturn / peakValue - 1;

    return {
      date: new Date(point.date).toLocaleDateString(),
      drawdown: Math.abs(Math.min(0, drawdown)), // Convert negative values to positive for display
    };
  });
}
