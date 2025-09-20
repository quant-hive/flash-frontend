import CustomPopoverContent from "@/components/custom-popover-content";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

const ExplainableAI = () => {
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
            <div className="flex flex-col">Explainable AI settings</div>
          </CustomPopoverContent>
        </Popover>
      </div>

      <Card className="bg-card border-2 border-card-border w-full mt-4 h-full">
        <CardContent className="pt-4 px-8 text-center h-full">
          <span className=" text-xl bg-clip-text text-transparent bg-text_accent_gradient">
            Explainable AI
            <sup className="bg-clip-text text-transparent bg-text_accent_gradient text-[10px] -top-2">
              {" "}
              TM
            </sup>
          </span>

          <hr className="my-3 h-0.5 bg-card-border" />

          <div className="flex flex-col items-center justify-center w-full h-full">
            <img src="/images/webp/oops.webp" alt="No Notifications" />

            <p className="text-center text-lg text-[#5A5A5A] mt-8">Oops!</p>
            <p className="text-center text-sm text-[#5A5A5A]">
              It looks like there's nothing to show here at the moment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplainableAI;
