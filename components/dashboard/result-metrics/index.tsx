import { Card, CardContent } from "@/components/ui/card";
import { BacktestMetrics } from "@/types/backtest-service";
import React, { useState } from "react";
import ResultMetricCard, {
  ShadowVariant,
} from "@/components/result-metric-card";

const ResultMetrics = ({ metrics }: { metrics: BacktestMetrics }) => {
  const [viewMoreMetrics, setViewMoreMetrics] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-2xl font-light">Result Highlights</h1>
        <div className="grid grid-cols-4 gap-[10px] mt-3">
          <ResultMetricCard
            title="Total Return"
            value={metrics.total_return}
            suffix="%"
            iconSrc="/svgs/total-return.svg"
            iconAlt="Total Return Icon Image"
            shadow="black"
          />

          <ResultMetricCard
            title="Max Drawdown"
            value={metrics.max_drawdown}
            suffix="%"
            iconSrc="/svgs/max-drawdown.svg"
            iconAlt="Max Drawdown Icon Image"
            shadow="red"
          />

          <ResultMetricCard
            title="Sharpe Ratio"
            value={metrics.sharpe}
            suffix="%"
            iconSrc="/svgs/sharpe-ratio.svg"
            iconAlt="Sharpe Ratio Icon Image"
            shadow={
              metrics.sharpe > 2
                ? "green"
                : metrics.sharpe > 1
                ? "yellow"
                : "red"
            }
          />

          <ResultMetricCard
            title="Annual Return"
            value={metrics.annual_return}
            suffix="%"
            iconSrc="/svgs/annual-return.svg"
            iconAlt="Annual Return Icon Image"
            shadow="green"
          />
        </div>

        <div 
          className={`grid grid-cols-4 gap-[10px] items-center transition-all duration-500 ease-in-out overflow-hidden ${
            viewMoreMetrics 
              ? 'opacity-100 max-h-32 transform translate-y-0 mt-4' 
              : 'opacity-0 max-h-0 transform -translate-y-4 mt-0'
          }`}
        >
            <ResultMetricCard
              title="Alpha (annualized)"
              value={metrics.alpha}
              suffix="%"
              iconSrc="/svgs/alpha.svg"
              iconAlt="Alpha Icon Image"
              shadow="black"
            />

            <ResultMetricCard
              title="Win rate"
              value={metrics.win_rate}
              suffix="%"
              iconSrc="/svgs/win-rate.svg"
              iconAlt="Win Rate Icon Image"
              shadow="yellow"
            />
          </div>
        
      </div>
      <div className="flex flex-row items-center w-full mt-6">
        <hr className="w-full border bg-[#2B2B2B]" />
        <button
          onClick={() => setViewMoreMetrics(!viewMoreMetrics)}
          className="flex justify-center w-60 mx-6 text-sm font-light bg-[#1B1B1D] border-2 border-[#2A2A2C] text-[#909092] py-2 rounded-sm text-nowrap"
        >
          {viewMoreMetrics ? "view less" : "view more"}
        </button>
        <hr className="w-full border bg-[#2B2B2B]" />
      </div>
    </>
  );
};

export default ResultMetrics;
