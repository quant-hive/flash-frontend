"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-14 shrink-0 border-[#B68C56] cursor-pointer items-center border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r data-[state=checked]:from-[#201300] data-[state=checked]:to-[#976018] data-[state=unchecked]:from-[#232323] data-[state=unchecked]:to-[#333333]",
      className
    )}
    {...props}
    ref={ref}
  >
    <div className="pointer-events-none flex items-center justify-center h-4 w-4 shadow-black/55 shadow-[1px_2px_5px] border-image-gradient-to-br from-[#D89A48] hover:from-[#C8E6FF]/[75%] to-[#794B0F] border-slice-1 border-slice-no-fill border-image-width-[2px] transition-transform has-[*[data-state=checked]]:translate-x-7 has-[*[data-state=unchecked]]:translate-x-2 duration-100">
      <SwitchPrimitives.Thumb
        className={cn("h-3 w-3 bg-btn_thumb_gradient transition-transform")}
      />
    </div>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
