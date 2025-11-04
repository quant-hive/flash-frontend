import CustomPopoverContent from "@/components/custom-popover-content";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ExplainableAI = () => {
  const pathname = usePathname();
  
  return (
    <>
      {!pathname.includes("backtest") ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <img src="/images/webp/oops.webp" alt="No Notifications" />

          <p className="text-center text-lg text-[#5A5A5A] mt-8">Oops!</p>
          <p className="text-center text-sm text-[#5A5A5A]">
            It looks like there's nothing to show here at the moment
          </p>
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 pr-2">
            <p className="text-[#4F4F4F] text-justify">
              1. Data Review: <br /> <br /> The backtest shows a modest overall
              performance with a total return of 34.58% over the period
              (approximately 4 years), translating to an annualized return of
              6.11%. The maximum drawdown of -6.21% indicates relatively low
              risk, while the volatility (0.0665 or 6.65%) is also moderate. The
              strategy executed 4947 position changes, suggesting frequent
              trading. A strategy change occurred on 2020-08-31, but the
              provided data doesn't allow assessment of its impact. Missing
              Information: The summary statistics provided do not contain
              details about periods of large drawdowns, underperformance, high
              volatility, or inactivity. The backtest report
              (/app/backtest_report.csv) is needed to assess these aspects.
              Specifically, analyzing the daily_pnl and portfolio_value columns
              against time would reveal such periods. Likewise, linking position
              changes with specific dates and portfolio value changes would be
              insightful.
            </p>
          </div>
          <div className="absolute flex flex-col gap-2 items-center justify-center bottom-0 z-20">
            <div className="w-fit flex items-center justify-center rounded-full p-0.5 bg-explainable_ai_dropdown_gradient">
              <div className="rounded-full flex justify-center items-center w-7 h-7 p-2 bg-[#1f1f1f]">
                <img
                  src="/svgs/arrow-down.svg"
                  alt="Arrow Downwards"
                  className="size-4"
                />
              </div>
            </div>

            <div className="border-2 border-[#292929] bg-[#151515] text-[#5A5A5A] rounded-md text-start py-2 px-4">
              Adjust the parameter to Y and re &nbsp; run the backtest
            </div>

            <div className="w-full border-2 border-[#1E4979] bg-gradient-to-br from-[#00479750] via-[#1B86FF50] to-[#00397850] rounded-md text-center py-1.5 mb-4">
              <p className="bg-clip-text text-transparent bg-explainable_ai_send_gradient">
                Send
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 h-52 w-full z-10 bg-explainable_ai_gradient pointer-events-none" />
        </div>
      )}
    </>
  );
};

export default ExplainableAI;
