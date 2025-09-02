import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export type ShadowVariant = "black" | "green" | "yellow" | "red";

const shadowMap: Record<ShadowVariant, string> = {
  black: "shadow-[inset_0_0px_22px_rgba(0,0,0,1)]",
  green: "shadow-[inset_0_0px_22px_rgba(41,255,28,1)]",
  yellow: "shadow-[inset_0_0px_22px_rgba(255,237,39,1)]",
  red: "shadow-[inset_0_0px_22px_rgba(255,28,25,1)]",
};

interface ResultMetricCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  iconSrc: string;
  iconAlt: string;
  shadow: ShadowVariant;
}

export default function ResultMetricCard({
  title,
  value,
  suffix = "%",
  iconSrc,
  iconAlt,
  shadow,
}: ResultMetricCardProps) {
  const valueText = typeof value === "number" ? value.toFixed(2) : value;
  const shadowClass = shadowMap[shadow];

  return (
    <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden">
      <CardContent className="flex flex-row justify-between h-full p-0">
        <div className="flex flex-col ml-6">
          <h2 className="font-light text-[#909092] mt-3">{title}</h2>
          <p className="text-2xl mt-2 text-[#FEFEFE]">
            {valueText}
            {suffix && (
              <span className="text-xl text-[#909092] ml-1">{suffix}</span>
            )}
          </p>
        </div>
        <div className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden">
          <div
            className={`absolute inset-0 w-full h-full z-10 ${shadowClass}`}
          />

          {/* Top Row */}
          <div className="absolute top-0 left-0 -translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
          <div className="absolute top-0 right-1/2 left-1/2 -translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
          <div className="absolute top-0 right-0 -translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

          {/* Middle Row */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
          <div className="absolute flex items-center justify-center top-1/2 right-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-[#1B1B1D] border border-[#323234] rounded-md">
            <img src={iconSrc} alt={iconAlt} className="size-5" />
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />

          {/* Bottom Row */}
          <div className="absolute bottom-0 left-0 translate-y-[60%] -translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
          <div className="absolute bottom-0 right-1/2 left-1/2 translate-y-[60%] -translate-x-1/2 w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
          <div className="absolute bottom-0 right-0 translate-y-[60%] translate-x-[38%] w-10 h-10 bg-[#161617] border border-[#212123] rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
