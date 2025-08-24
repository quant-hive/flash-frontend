import { Card, CardContent } from "@/components/ui/card";
import { BacktestMetrics } from "@/types/backtest-service";
import React, { useState } from "react";

const ResultMetrics = ({ metrics }: { metrics: BacktestMetrics }) => {
  const [viewMoreMetrics, setViewMoreMetrics] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-2xl font-light">Result Highlights</h1>
        <div className="grid grid-cols-4 gap-[10px] mt-3">
          <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
            <CardContent className="flex flex-row justify-between h-full p-0">
              <div className="flex flex-col mt-3 ml-6">
                <h2 className="font-light text-lg text-[#909092]">
                  Total Return
                </h2>
                <p className="text-3xl text-[#FEFEFE]">
                  {metrics.total_return.toFixed(2)}
                  <span className="text-xl text-[#909092] ml-1">%</span>
                </p>
              </div>
              <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                <div className="absolute inset-0 w-full h-full shadow-[inset_0_0px_22px_rgba(0,0,0,1)] z-10" />
                <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                  <img
                    src="/svgs/total-return.svg"
                    alt="Total Return Icon Image"
                    className="size-5"
                  />
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
            <CardContent className="flex flex-row justify-between h-full p-0">
              <div className="flex flex-col mt-3 ml-6">
                <h2 className="font-light text-lg text-[#909092]">
                  Max Drawdown
                </h2>
                <p className="text-3xl text-[#FEFEFE]">
                  {metrics.max_drawdown.toFixed(2)}
                  <span className="text-xl text-[#909092] ml-1">%</span>
                </p>
              </div>
              <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                <div className="absolute inset-0 w-full h-full shadow-[inset_0_0px_22px_rgba(255,28,25,1)] z-10" />
                <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                  <img
                    src="/svgs/max-drawdown.svg"
                    alt="Max Drawdown Icon Image"
                    className="size-5"
                  />
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
            <CardContent className="flex flex-row justify-between h-full p-0">
              <div className="flex flex-col mt-3 ml-6">
                <h2 className="font-light text-lg text-[#909092]">
                  Sharpe Ratio
                </h2>
                <p className="text-3xl text-[#FEFEFE]">
                  {metrics.sharpe.toFixed(2)}
                  <span className="text-xl text-[#909092] ml-1">%</span>
                </p>
              </div>
              <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                <div
                  className={`absolute inset-0 w-full h-full z-10 ${
                    metrics.sharpe > 0 && metrics.sharpe < 1
                      ? "shadow-[inset_0_0px_22px_rgba(255,28,25,1)]"
                      : metrics.sharpe > 1 && metrics.sharpe < 2
                      ? "shadow-[inset_0_0px_22px_rgba(255,237,39,1)]"
                      : metrics.sharpe > 2 &&
                        "shadow-[inset_0_0px_22px_rgba(41,255,28,1)]"
                  }`}
                />
                <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                  <img
                    src="/svgs/sharpe-ratio.svg"
                    alt="Sharpe Ratio Icon Image"
                    className="size-5"
                  />
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
            <CardContent className="flex flex-row justify-between h-full p-0">
              <div className="flex flex-col mt-3 ml-6">
                <h2 className="font-light text-lg text-[#909092]">
                  Annual Return
                </h2>
                <p className="text-3xl text-[#FEFEFE]">
                  {metrics.annual_return.toFixed(2)}
                  <span className="text-xl text-[#909092] ml-1">%</span>
                </p>
              </div>
              <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                <div className="absolute inset-0 w-full h-full shadow-[inset_0_0px_22px_rgba(41,255,28,1)] z-10" />
                <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                  <img
                    src="/svgs/annual-return.svg"
                    alt="Annual Return Icon Image"
                    className="size-5"
                  />
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>

        {viewMoreMetrics && (
          <div className="grid grid-cols-4 gap-[10px] items-center mt-4">
            <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
              <CardContent className="flex flex-row justify-between h-full p-0">
                <div className="flex flex-col mt-3 ml-6">
                  <h2 className="font-light text-lg text-[#909092]">
                    Alpha (annualized)
                  </h2>
                  <p className="text-3xl text-[#FEFEFE]">
                    {metrics.alpha.toFixed(2)}
                    <span className="text-xl text-[#909092] ml-1">%</span>
                  </p>
                </div>
                <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                  <div className="absolute inset-0 w-full h-full shadow-[inset_0_0px_22px_rgba(0,0,0,1)] z-10" />
                  <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                    <img
                      src="/svgs/alpha.svg"
                      alt="Alpha Icon Image"
                      className="size-5"
                    />
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                  <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
              <CardContent className="flex flex-row justify-between h-full p-0">
                <div className="flex flex-col mt-3 ml-6">
                  <h2 className="font-light text-lg text-[#909092]">
                    Win rate
                  </h2>
                  <p className="text-3xl text-[#FEFEFE]">
                    {metrics.win_rate.toFixed(2)}
                    <span className="text-xl text-[#909092] ml-1">%</span>
                  </p>
                </div>
                <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
                  <div className="absolute inset-0 w-full h-full shadow-[inset_0_0px_22px_rgba(255,237,39,1)] z-10" />
                  <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
                    <img
                      src="/svgs/win-rate.svg"
                      alt="Win Rate Icon Image"
                      className="size-5"
                    />
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

                  <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                  <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center w-full mt-[40px]">
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
