import CustomPopoverContent from "@/components/custom-popover-content";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ExplainableAI from "../dashboard/explainable-ai/page";
import Params from "../dashboard/backtest/params";

const RightPanel = () => {
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
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
            <div className="flex flex-col">Right panel settings</div>
          </CustomPopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg bg-card border-2 border-card-border w-full mt-4 flex-1 flex flex-col pt-2 text-center overflow-hidden">
        <Tabs
          defaultValue="params"
          className="w-full h-full flex flex-col"
        >
          <div className="flex-shrink-0">
            <TabsList className="bg-transparent rounded-none gap-6 p-0">
              <TabsTrigger
                value="params"
                className="h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-white hover:bg-muted-foreground group rounded-none"
              >
                <span className="text-muted-text group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent group-data-[state=active]:bg-text_accent_gradient">
                  Params
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="explainable-ai"
                className="h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-white hover:bg-muted-foreground group rounded-none"
              >
                <span className="text-muted-text group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent group-data-[state=active]:bg-text_accent_gradient">
                  Explainable AI
                  <sup className="text-muted-text group-data-[state=active]:bg-clip-text group-data-[state=active]:text-transparent group-data-[state=active]:bg-text_accent_gradient text-[9px] -top-2">
                    {" "}
                    TM
                  </sup>
                </span>
              </TabsTrigger>
            </TabsList>

            <hr className="h-0.5 bg-card-border" />
          </div>

          <TabsContent
            value="explainable-ai"
            className="flex-1 px-6 py-4 overflow-auto"
          >
            <ExplainableAI />
          </TabsContent>

          <TabsContent
            value="params"
            className="flex-1 px-6 py-4 overflow-auto custom-scrollbar"
          >
            <Params />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RightPanel;
