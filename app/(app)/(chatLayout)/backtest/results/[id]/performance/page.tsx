"use client";

import { ErrorState } from "@/components/dashboard/backtest/error-state";
import { LoadingState } from "@/components/dashboard/backtest/loading-state";
import MonthlyReturnsHeatmap from "@/components/dashboard/backtest/new-monthly-returns-heatmap";
import { useBacktestResults } from "@/context/backtest-results-context";
import { TrendingDown } from "lucide-react";
import React from "react";

const Performance = () => {
  const { loading, error } = useBacktestResults();
  const metrics = useBacktestResults().results?.metrics;
  const returnsData = useBacktestResults().returnsData;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onClose={() => {}} />;

  return (
    <div className="w-full h-full flex flex-col overflow-auto custom-scrollbar pr-2">
      <div className="flex flex-col">
        <h1 className="text-2xl font-light">Performance</h1>

        <div className="mt-4 grid grid-cols-5 grid-rows-1 bg-[#1B1B1D] border-2 border-[#2A2A2C]">
          <div className="flex flex-col justify-between p-4 gap-2 border-r-2 border-[#2A2A2C]">
            <h2 className="text-xl text-[#909092] font-light">Total Return</h2>
            <p className="text-4xl mt-2 text-[#FEFEFE]">
              {metrics?.total_return}
              <span className="text-2xl text-[#909092]">%</span>
            </p>
          </div>

          <div className="flex flex-col justify-between p-4 gap-2 border-r-2 border-[#2A2A2C]">
            <h2 className="text-xl text-[#909092] font-light">Annual Return</h2>
            <p className="text-4xl mt-2 text-[#FEFEFE]">
              {metrics?.annual_return}
              <span className="text-2xl text-[#909092]">%</span>
            </p>
          </div>

          <div className="flex flex-col justify-between p-4 gap-2 border-r-2 border-[#2A2A2C]">
            <h2 className="text-xl text-[#909092] font-light">Volatility</h2>
            <p className="text-4xl mt-2 text-[#FEFEFE]">
              {metrics?.volatility}
            </p>
          </div>

          <div className="flex flex-col justify-between p-4 gap-2 border-r-2 border-[#2A2A2C]">
            <h2 className="text-xl text-[#909092] font-light">Sharpe</h2>
            <p className="text-4xl mt-2 text-[#FEFEFE]">{metrics?.sharpe}</p>
          </div>

          <div className="flex flex-col justify-between p-4 gap-2">
            <h2 className="text-xl text-[#909092] font-light">Win Rate</h2>
            <p className="text-4xl mt-2 text-[#FEFEFE]">
              {metrics?.win_rate}
              <span className="text-2xl text-[#909092]">%</span>
            </p>
          </div>
        </div>
      </div>

      <hr className="my-6 border border-[#2B2B2B]" />

      <div className="flex flex-row gap-4 w-full">
        <div className="flex flex-col w-[68%]">
          <h1 className="text-2xl font-light">Performance Metrics</h1>

          <div className="mt-4 flex flex-col bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full">
            <div className="relative overflow-hidden flex flex-row items-end justify-between px-4 py-3 border-b-2 border-[#2A2A2C] gap-4 w-full">
              <div className="flex flex-col gap-3 z-10">
                <div className="flex items-center justify-center rounded-lg size-6 border-[0.125rem] border-[#909092]">
                  <TrendingDown
                    className="size-[13px] text-[#909092]"
                    strokeWidth={3}
                  />
                </div>

                <h2 className="text-[#909092] text-lg font-light">
                  Max Drawdown
                </h2>
              </div>

              <p className="text-4xl z-10">
                {metrics?.max_drawdown}
                <span className="text-3xl text-[#909092]"> %</span>
              </p>

              <div
                className={`absolute right-0 bottom-0 translate-x-[40%] blur-2xl translate-y-[55%] size-24 rounded-full ${
                  (metrics?.max_drawdown ?? 0) < 0
                    ? "bg-[#FF2828]"
                    : "bg-[#28FF28]"
                }`}
              />
            </div>

            <div className="grid grid-rows-1 grid-cols-2 border-b-2 border-[#2A2A2C]">
              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">Trades</h2>
                <p className="text-2xl text-[#FEFEFE]">{metrics?.trades}</p>
              </div>

              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-l-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">Sortino</h2>
                <p className="text-2xl text-[#FEFEFE]">{metrics?.sortino}</p>
              </div>
            </div>

            <div className="grid grid-rows-1 grid-cols-2 border-b-2 border-[#2A2A2C]">
              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">
                  Initial Value
                </h2>
                <p className="text-2xl text-[#FEFEFE]">
                  {metrics?.initial_value.toFixed(4)}
                </p>
              </div>

              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-l-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">
                  Final Value
                </h2>
                <p className="text-2xl text-[#FEFEFE]">
                  {metrics?.final_value.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="grid grid-rows-1 grid-cols-2">
              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">Alpha</h2>
                <p className="text-2xl text-[#FEFEFE]">
                  {metrics?.alpha}
                  <span className="text-xl text-[#909092]">%</span>
                </p>
              </div>

              <div className="flex flex-col justify-between px-4 py-2 gap-2 border-l-2 border-[#2A2A2C]">
                <h2 className="text-lg text-[#909092] font-light">Beta</h2>
                <p className="text-2xl text-[#FEFEFE]">{metrics?.beta}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <h1 className="text-2xl font-light">Monthly Returns</h1>

          <MonthlyReturnsHeatmap returnsData={returnsData} />
        </div>
      </div>
    </div>
  );
};

export default Performance;
