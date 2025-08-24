"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { ReturnData } from "@/types/backtest-service";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import CustomPopoverContent from "@/components/custom-popover-content";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

interface ReturnsComparisonChartProps {
  data: ReturnData[];
}

export function ReturnsComparisonChart({ data }: ReturnsComparisonChartProps) {
  const { theme } = useTheme();

  // Month-year values: YYYY-MM
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minMonth, setMinMonth] = useState<string>("");
  const [maxMonth, setMaxMonth] = useState<string>("");

  // Local state that powers the chart (starts with full data)
  const [visibleData, setVisibleData] = useState<ReturnData[]>(data);

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

  // Arrow function to filter by month-year range and update chart
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

  useEffect(() => {
    // When start/end change, re-filter automatically (if both present)
    if (startDate && endDate) {
      filterDate(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Calculate cumulative returns from the visible (filtered) data
  const cumulativeData = visibleData.reduce((acc, current, index) => {
    if (index === 0) {
      acc.push({
        date: new Date(current.date).toLocaleDateString(),
        strategy: (1 + current.strategy_return) * 100 - 100,
        benchmark: (1 + current.benchmark_return) * 100 - 100,
      });
      return acc;
    }

    const prevCumulative = acc[index - 1];
    acc.push({
      date: new Date(current.date).toLocaleDateString(),
      strategy:
        ((1 + prevCumulative.strategy / 100) * (1 + current.strategy_return) -
          1) *
        100,
      benchmark:
        ((1 + prevCumulative.benchmark / 100) * (1 + current.benchmark_return) -
          1) *
        100,
    });
    return acc;
  }, [] as Array<{ date: string; strategy: number; benchmark: number }>);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg bg-blue_accent_gradient p-[2px] rounded-xl">
          <CardContent className="bg-[#222222] rounded-[10px] py-3 px-4">
            <p className="">{label}</p>
            <p className="text-sm">
              <span className="text-[#84B869]">●</span> Strategy:{" "}
              {payload[0].value.toFixed(2)}%
            </p>
            <p className="text-sm">
              <span className="text-[#229EC4]">●</span> Benchmark:{" "}
              {payload[1].value.toFixed(2)}%
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
        <h1 className="text-2xl font-light">
          Strategy v Benchmark Performance
        </h1>
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
              <div className="flex flex-col gap-2">
                <div>Settings</div>
                <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Demo Chat
                </button>
                <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  Clear Chat
                </button>
              </div>
            </CustomPopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="w-full mt-3 bg-[#1B1B1D] border-2 border-[#2A2A2C]">
        <CardContent className="p-6 pt-4">
          <div className="flex flex-row justify-between items-center mb-2">
            <legend className="flex flex-row gap-6 items-center">
              <div className="flex flex-row gap-2 items-center">
                <div className="size-4 bg-green_icon_legend_gradient" />
                <span className="text-transparent bg-clip-text bg-green_text_legend_gradient">
                  Strategy
                </span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="size-4 bg-blue_icon_legend_gradient" />
                <span className="text-transparent bg-clip-text bg-blue_text_legend_gradient">
                  Benchmark
                </span>
              </div>
            </legend>

            <Popover>
              <PopoverTrigger className="bg-[#111113] border-2 border-[#2A2A2C] rounded-lg px-4 py-2 flex items-center justify-center">
                <Calendar size={16} color="#909092" />
                <span className="ml-2 text-sm text-[#909092]">
                  {startDate && endDate
                    ? `${format(
                        new Date(`${startDate}-01`),
                        "MMM yyyy"
                      )} - ${format(new Date(`${endDate}-01`), "MMM yyyy")}`
                    : "Select Date Range"}
                </span>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                side="bottom"
                className="flex flex-col gap-4 w-auto p-4 bg-[#000000] bg-opacity-20 backdrop-blur-md border-2 border-[#2A2A2C] rounded-lg"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="start-date"
                    className="text-sm text-[#909092]"
                  >
                    From
                  </label>
                  <input
                    id="start-date"
                    type="month"
                    className="bg-[#111113] rounded-md px-3 py-1 text-sm text-[#909092]"
                    value={startDate}
                    min={minMonth || undefined}
                    max={maxMonth || undefined}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="end-date" className="text-sm text-[#909092]">
                    To
                  </label>
                  <input
                    id="end-date"
                    type="month"
                    className="bg-[#111113] rounded-md px-3 py-1 text-sm text-[#909092]"
                    value={endDate}
                    min={minMonth || undefined}
                    max={maxMonth || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="h-80 mt-4 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cumulativeData}
                margin={{ top: 0, right: 20, left: 0, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray={"3 3"} stroke="#2F2F2F" />
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
                  label={{
                    value: "Date (MM/YY)",
                    position: "insideBottom",
                    offset: -12,
                  }}
                />
                <YAxis
                  stroke="#909092"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  label={{
                    angle: -90,
                    position: "insideLeft",
                    value: "Returns (%)",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* <Legend /> */}
                <Line
                  type="monotone"
                  dataKey="strategy"
                  name="Strategy"
                  stroke="#84B869"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Benchmark"
                  stroke="#229EC4"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
