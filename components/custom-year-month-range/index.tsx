import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface CustomYearMonthRangeProps {
  startDate?: string;
  endDate?: string;
  minMonth?: string;
  maxMonth?: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const CustomYearMonthRange: React.FC<CustomYearMonthRangeProps> = ({
  startDate,
  endDate,
  minMonth,
  maxMonth,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger className="bg-[#111113] border-2 border-[#2A2A2C] rounded-lg px-4 py-2 flex items-center justify-center">
        <Calendar size={16} color="#909092" />
        <span className="ml-2 text-sm text-[#909092]">
          {startDate && endDate
            ? `${format(new Date(`${startDate}-01`), "MMM yyyy")} - ${format(
                new Date(`${endDate}-01`),
                "MMM yyyy"
              )}`
            : "Select Date Range"}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="bottom"
        className="flex flex-col gap-4 w-auto p-4 bg-[#000000] bg-opacity-20 backdrop-blur-md border-2 border-[#2A2A2C] rounded-lg"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="start-date" className="text-sm text-[#909092]">
            From
          </label>
          <input
            id="start-date"
            type="month"
            className="bg-[#111113] rounded-md px-3 py-1 text-sm text-[#909092]"
            value={startDate || ""}
            min={minMonth || undefined}
            max={maxMonth || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
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
            value={endDate || ""}
            min={minMonth || undefined}
            max={maxMonth || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomYearMonthRange;
