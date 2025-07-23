"use client";

import React, { ReactNode } from "react";
import { useCursor } from "../providers/cursor";

interface HoverTooltipWrapperProps {
  tooltip: string;
  children: ReactNode;
}

const HoverTooltipWrapper: React.FC<HoverTooltipWrapperProps> = ({
  tooltip,
  children,
}) => {
  const { showTooltip, hideTooltip } = useCursor();

  return (
    <span
      onMouseEnter={() => showTooltip(tooltip)}
      onMouseLeave={hideTooltip}
      style={{ display: "inline-block" }}
    >
      {children}
    </span>
  );
};

export default HoverTooltipWrapper;
