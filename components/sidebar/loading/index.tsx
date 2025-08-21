import { cn } from "@/lib/utils";
import React from "react";

const SideBarLoading = () => {
  return (
    <aside className={`flex rounded-l-xl overflow-hidden h-full`}>
      <div
        className={cn(
          "z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static h-full w-56 pr-0.5 justify-between pt-4 pb-4 pl-5"
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center text-xl select-none">
            Flash <sup className="text-[9px]">TM</sup>
          </div>

          <div className="flex-1 overflow-auto pl-0.5 pr-0.5 py-0.5 mt-3">
            <div className="relative w-full transition-all duration-300 ease-in-out">
              <nav className="flex flex-col flex-1 gap-1.5">
                {/* Navigation skeleton items */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex items-center rounded-md pl-4 py-1 animate-pulse">
                      <div className="h-4 w-4 mr-3 bg-muted rounded"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}

                <hr className="border-muted-foreground rounded-full mt-4" />

                <div className="mt-4 pl-0.5">
                  <div className="flex items-center rounded-md pl-4 py-1 animate-pulse">
                    <div className="h-4 w-4 mr-3 bg-muted rounded"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {/* Pro tier promotion skeleton */}
          <div className="flex flex-col rounded-xl overflow-hidden border-2 border-[#2A2A2A] bg-[#222222] mb-8 shadow-lg select-none animate-pulse">
            <div className="relative">
              <div className="absolute flex flex-col z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className="h-6 w-16 bg-muted rounded mb-1"></div>
                <div className="h-3 w-20 bg-muted rounded"></div>
              </div>
              <div className="absolute w-full h-full bg-gradient-to-b from-[#001B3A] via-[#00142A]/[50%] to-[#00142A]/[0%]" />
              <div className="w-full h-20 bg-muted"></div>
            </div>

            <div className="flex flex-col items-center justify-center px-1.5 pt-1 pb-1">
              <div className="flex flex-col text-center">
                <div className="h-4 w-32 bg-muted rounded mt-1.5 mb-0.5"></div>
                <div className="h-3 w-40 bg-muted rounded"></div>
              </div>

              <div className="flex flex-row pt-1 items-center border border-[#1E4979] rounded-lg mt-3 bg-gradient-to-br from-[#004797]/[30%] via-[#1B86FF]/[30%] to-[#003978]/[30%] w-full">
                <div className="-ml-0.5 w-14 h-10 bg-muted rounded"></div>
                <div className="flex flex-col">
                  <div className="h-4 w-20 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              </div>

              <div className="w-full h-8 bg-muted rounded-lg mt-1.5"></div>
            </div>
          </div>

          <hr className="border-muted-foreground rounded-full mb-2" />

          {/* User profile skeleton */}
          <div className="flex flex-row items-center justify-between rounded-xl w-full pl-2.5 pr-1.5 py-1.5 animate-pulse">
            <div className="flex flex-row items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted"></div>
              <div className="flex flex-col items-start justify-between">
                <div className="h-4 w-16 bg-muted rounded mb-1"></div>
                <div className="h-3 w-20 bg-muted rounded"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBarLoading;
