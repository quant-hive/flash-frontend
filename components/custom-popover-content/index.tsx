import React from "react";
import { PopoverContent } from "../ui/popover";

const CustomPopoverContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <PopoverContent
      className={`w-52 mb-8 bg-blue_accent_gradient p-0.5 rounded-xl ${className}`}
    >
      <div className="flex w-full bg-[#222222] rounded-[10px] p-4">
        {children}
      </div>
    </PopoverContent>
  );
};

export default CustomPopoverContent;
