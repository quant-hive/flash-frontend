"use client";

import { MousePointer2 } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTouchDevice } from "@/hooks";

type CursorPosition = {
  x: number;
  y: number;
};

type TooltipData = {
  content: string;
  visible: boolean;
};

type CursorContextType = {
  position: CursorPosition;
  tooltip: TooltipData;
  showTooltip: (content: string) => void;
  hideTooltip: () => void;
};

const CursorContext = createContext<CursorContextType | null>(null);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) throw new Error("useCursor must be used within CursorProvider");
  return context;
};

export const CursorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  let animationFrameId: number;
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipData>({
    content: "",
    visible: false,
  });
  const [isVisible, setIsVisible] = useState<boolean>(false); // Start as false during page load
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  const [isMouseInWindow, setIsMouseInWindow] = useState<boolean>(false); // Track if mouse is in window
  const isTouchDevice = useTouchDevice(); // Use the custom hook
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Calculate tooltip position with boundary checking
  const getTooltipPosition = () => {
    const offset = 20;
    const buffer = 20; // Extra space to account for scrollbar and bottom
    let tooltipWidth = 200; // Default fallback
    let tooltipHeight = 40; // Default fallback

    // Get actual tooltip dimensions if available
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      tooltipWidth = rect.width;
      tooltipHeight = rect.height;
    }

    let top = position.y + offset;
    let left = position.x + offset;

    // Check right boundary with scrollbar buffer
    if (left + tooltipWidth > window.innerWidth - buffer) {
      left = position.x - tooltipWidth - offset + 10; // Added 10px extra space to match user experience and satisfy eyes
    }

    // Check bottom boundary
    if (top + tooltipHeight > window.innerHeight - buffer) {
      top = position.y - tooltipHeight - offset + 14; // Added 14px extra space to match user experience and satisfy eyes
    }

    // Check left boundary
    if (left < 0) {
      left = position.x + offset;
    }

    // Check top boundary
    if (top < 0) {
      top = position.y + offset;
    }

    return { top, left };
  };

  // Effect to handle dynamic cursor visibility when touch device status changes
  useEffect(() => {
    if (isTouchDevice && isVisible) {
      // Hide cursor immediately if touch device is detected
      setIsVisible(false);
    }
  }, [isTouchDevice, isVisible]);

  // Effect to handle cursor visibility based on mouse presence in window
  useEffect(() => {
    // Only show cursor if page is ready, not a touch device, and mouse is in window
    const shouldBeVisible = isPageReady && !isTouchDevice && isMouseInWindow;
    setIsVisible(shouldBeVisible);
  }, [isPageReady, isTouchDevice, isMouseInWindow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Queue DOM updates with requestAnimationFrame
      animationFrameId = requestAnimationFrame(() => {
        setPosition({ x: clientX, y: clientY });

        // Mark that mouse is in the window
        if (!isMouseInWindow) {
          setIsMouseInWindow(true);
        }
      });
    };

    const handleMouseLeave = () => {
      // Hide cursor when mouse leaves the window
      setIsMouseInWindow(false);
    };

    const handleMouseEnter = () => {
      // Show cursor when mouse enters the window
      if (isPageReady && !isTouchDevice) {
        setIsMouseInWindow(true);
      }
    };

    const handlePageLoad = () => {
      setIsPageReady(true);
    };

    const handleDOMContentLoaded = () => {
      setIsPageReady(true);
    };

    const handleWindowFocus = () => {
      // Don't automatically show cursor on window focus
      // Cursor will only show when mouse moves in the window
    };

    const handleWindowBlur = () => {
      // Hide cursor when window loses focus
      setIsMouseInWindow(false);
    };

    const handleVisibilityChange = () => {
      // Hide cursor when page becomes hidden, don't auto-show when visible
      if (document.visibilityState === "hidden") {
        setIsMouseInWindow(false);
      }
    };

    // Check if page is already loaded
    if (document.readyState !== "loading") {
      setIsPageReady(true);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("load", handlePageLoad);
    document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("load", handlePageLoad);
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPageReady, isVisible, isTouchDevice, isMouseInWindow]);

  // Separate effect to handle global cursor styles based on touch device detection
  useEffect(() => {
    let style: HTMLStyleElement | null = null;

    if (!isTouchDevice) {
      // Hide default cursor globally only if not a touch device
      document.body.style.cursor = "none";
      document.documentElement.style.cursor = "none";

      // Add global style to hide cursor on all elements
      style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          cursor: none !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Restore default cursor for touch devices
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
    }

    return () => {
      // Cleanup: restore default cursor and remove style
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isTouchDevice]);

  const showTooltip = (content: string) => {
    setTooltip({ content, visible: true });
  };

  const hideTooltip = () => {
    setTooltip({ content: "", visible: false });
  };

  return (
    <CursorContext.Provider
      value={{ position, tooltip, showTooltip, hideTooltip }}
    >
      {/* Custom cursor */}
      {isVisible && !isTouchDevice && (
        <MousePointer2
          fill="#268CFF"
          stroke="#268CFF"
          className="fixed z-[9999] -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_6px_6px_rgba(16,80,153,0.8)]"
          style={{
            top: position.y + 8,
            left: position.x + 8,
          }}
        />
      )}
      {/* Tooltip */}
      {tooltip.visible && isVisible && !isTouchDevice && (
        <div
          ref={tooltipRef}
          className="fixed bg-tooltip_bg_gradient border-2 border-[#268CFF] flex items-center justify-center px-[14px] py-[3px] rounded-full pointer-events-none z-[10000] transition-all ease-out animate-fade-in duration-300 whitespace-nowrap  drop-shadow-[0_4px_12px_rgba(16,80,153,0.7)]"
          style={getTooltipPosition()}
        >
          <span className="-mt-0.5 text-transparent bg-clip-text bg-tooltip_text_gradient text-[14px] font-semibold">
            {tooltip.content.toLowerCase()}
          </span>
        </div>
      )}
      {children}
    </CursorContext.Provider>
  );
};
