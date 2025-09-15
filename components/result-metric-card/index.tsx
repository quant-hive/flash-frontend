import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

export type ShadowVariant = "black" | "green" | "yellow" | "red";

const shadowMap: Record<ShadowVariant, string> = {
  black: "shadow-[inset_0_0px_22px_rgba(0,0,0,1)]",
  green: "shadow-[inset_0_0px_18px_rgba(41,255,28,1)]",
  yellow: "shadow-[inset_0_0px_18px_rgba(255,225,0,1)]",
  red: "shadow-[inset_0_0px_20px_rgba(255,0,0,1)]",
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

  const [initialDone, setInitialDone] = useState(false);

  return (
    <Card className="bg-[#1B1B1D] border-2 border-[#2A2A2C] w-full h-24 rounded-xl overflow-hidden group">
      <style jsx global>{`
        @keyframes pulseShadow {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes infinitePulseShadow {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-pulse-shadow {
          animation: pulseShadow 2s 3 ease-out;
        }

        .animate-infinite-pulse-shadow {
          animation: infinitePulseShadow 2s infinite ease-out;
        }
      `}</style>

      <CardContent className="group flex flex-row justify-between h-full p-0">
        <div className="flex flex-col ml-6">
          <h2 className="font-light text-[#909092] mt-3">{title}</h2>
          <p className="text-2xl mt-2 text-[#FEFEFE]">
            {valueText}
            {suffix && (
              <span className="text-xl text-[#909092] ml-1">{suffix}</span>
            )}
          </p>
        </div>
        <div
          className="relative border-l-2 border-[#2A2A2C] h-full w-28 bg-[#111113] overflow-hidden"
          onMouseEnter={() => setInitialDone(true)} // prevent resuming 3x after first hover
        >
          <div
            onAnimationEnd={(e) => {
              if (e.animationName === "pulseShadow") setInitialDone(true);
            }}
            className={`absolute inset-0 w-full h-full z-10 ${shadowClass} ${
              initialDone ? "" : "animate-pulse-shadow"
            } group-hover:animate-[infinitePulseShadow_2s_ease-out_infinite]`}
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
