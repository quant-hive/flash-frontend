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
  isVisible: boolean;
  showTooltip: (content: string) => void;
  hideTooltip: () => void;
  showCursor: () => void;
  hideCursor: () => void;
  toggleCursor: () => void;
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
  const animationFrameId = React.useRef<number>();
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipData>({
    content: "",
    visible: false,
  });
  const [isTooltipExiting, setIsTooltipExiting] = useState<boolean>(false);
  const exitTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false); // Start as false during page load
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  const [isMouseInWindow, setIsMouseInWindow] = useState<boolean>(false); // Track if mouse is in window
  const [forceHidden, setForceHidden] = useState<boolean>(false); // Manual cursor visibility control
  const [isDragging, setIsDragging] = useState<boolean>(false); // Track drag state
  const isTouchDevice = useTouchDevice(); // Use the custom hook
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const lastPosition = React.useRef<CursorPosition>({ x: 0, y: 0 });
  const currentUrl = React.useRef<string>(
    typeof window !== "undefined" ? window.location.href : ""
  );

  // Effect to monitor URL changes and hide tooltip
  useEffect(() => {
    const checkUrlChange = () => {
      const newUrl = window.location.href;
      if (currentUrl.current !== newUrl) {
        currentUrl.current = newUrl;
        // Hide tooltip immediately on URL change with animation
        if (tooltip.visible) {
          if (exitTimeoutRef.current) {
            clearTimeout(exitTimeoutRef.current);
          }
          setIsTooltipExiting(true);
          exitTimeoutRef.current = setTimeout(() => {
            setTooltip({ content: "", visible: false });
            setIsTooltipExiting(false);
            exitTimeoutRef.current = null;
          }, 300); // Match the animation duration
        }
      }
    };

    // Monitor URL changes through various methods
    const handlePopState = () => {
      checkUrlChange();
    };

    const handleHashChange = () => {
      checkUrlChange();
    };

    // Use MutationObserver to detect any changes that might affect the URL
    const observer = new MutationObserver(() => {
      checkUrlChange();
    });

    // Start observing the document for changes
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });

    // Set up interval to periodically check URL (fallback for programmatic navigation)
    const urlCheckInterval = setInterval(checkUrlChange, 100);

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      observer.disconnect();
      clearInterval(urlCheckInterval);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [tooltip.visible]); // Add tooltip.visible as dependency

  // Additional effect to immediately hide tooltip on any navigation
  useEffect(() => {
    const handleNavigationStart = () => {
      if (tooltip.visible) {
        // Immediately hide tooltip without animation for instant response
        if (exitTimeoutRef.current) {
          clearTimeout(exitTimeoutRef.current);
          exitTimeoutRef.current = null;
        }
        setTooltip({ content: "", visible: false });
        setIsTooltipExiting(false);
      }
    };

    // Listen for beforeunload to catch immediate navigation
    window.addEventListener("beforeunload", handleNavigationStart);

    // Listen for any link clicks
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest(
        'a, button[type="submit"], input[type="submit"]'
      );
      if (link) {
        handleNavigationStart();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleNavigationStart);
    };
  }, [tooltip.visible]);

  // Calculate tooltip position with boundary checking
  const getTooltipPosition = React.useCallback(() => {
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
  }, [position.x, position.y]);

  // Effect to handle dynamic cursor visibility when touch device status changes
  useEffect(() => {
    if (isTouchDevice && isVisible) {
      // Hide cursor immediately if touch device is detected
      setIsVisible(false);
    }
  }, [isTouchDevice, isVisible]);

  // Effect to handle cursor visibility based on mouse presence in window
  useEffect(() => {
    // Only show cursor if page is ready, not a touch device, mouse is in window, and not force hidden
    const shouldBeVisible =
      isPageReady && !isTouchDevice && isMouseInWindow && !forceHidden;
    setIsVisible(shouldBeVisible);
  }, [isPageReady, isTouchDevice, isMouseInWindow, forceHidden]);

  useEffect(() => {
    const updatePosition = (clientX: number, clientY: number) => {
      // Skip update if position hasn't changed significantly (reduce unnecessary re-renders)
      const threshold = 1;
      if (
        Math.abs(clientX - lastPosition.current.x) < threshold &&
        Math.abs(clientY - lastPosition.current.y) < threshold
      ) {
        return;
      }

      // Queue DOM updates with requestAnimationFrame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        lastPosition.current = { x: clientX, y: clientY };
        setPosition({ x: clientX, y: clientY });

        // Mark that mouse is in the window
        if (!isMouseInWindow) {
          setIsMouseInWindow(true);
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
    };

    const handleDragOver = (e: DragEvent) => {
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Only handle if it's a mouse pointer (not touch or pen)
      if (e.pointerType === "mouse") {
        const { clientX, clientY } = e;
        updatePosition(clientX, clientY);
      }
    };

    const handleDragStart = (e: DragEvent) => {
      // Ensure cursor continues to track during drag operations
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
    };

    const handleDrag = (e: DragEvent) => {
      // Continue tracking during drag
      const { clientX, clientY } = e;
      // Only update if we have valid coordinates (drag events can have 0,0 coordinates)
      if (clientX !== 0 || clientY !== 0) {
        updatePosition(clientX, clientY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
    };

    // Enhanced mouse move handler that works even during drag operations
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      updatePosition(clientX, clientY);
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
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("drag", handleDrag);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    // Add global mouse move listener that captures all mouse movements
    window.addEventListener("mousemove", handleGlobalMouseMove, true);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("load", handlePageLoad);
    document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("drag", handleDrag);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove, true);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("load", handlePageLoad);
      document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Clear any pending tooltip exit timeout
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [isPageReady, isVisible, isTouchDevice, isMouseInWindow, isDragging]);

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

  const showCursor = React.useCallback(() => {
    setForceHidden(false);
  }, []);

  const hideCursor = React.useCallback(() => {
    setForceHidden(true);
  }, []);

  const toggleCursor = React.useCallback(() => {
    setForceHidden((prev) => !prev);
  }, []);

  const showTooltip = React.useCallback((content: string) => {
    // Clear any existing exit timeout to allow immediate showing of new tooltip
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    // Reset exit state and show new tooltip immediately
    setIsTooltipExiting(false);
    setTooltip({ content, visible: true });
  }, []);

  const hideTooltip = React.useCallback(() => {
    if (tooltip.visible && !isTooltipExiting) {
      // Clear any existing timeout
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }

      setIsTooltipExiting(true);
      exitTimeoutRef.current = setTimeout(() => {
        setTooltip({ content: "", visible: false });
        setIsTooltipExiting(false);
        exitTimeoutRef.current = null;
      }, 300); // Match the animation duration
    }
  }, [tooltip.visible, isTooltipExiting]);

  const contextValue = React.useMemo(
    () => ({
      position,
      tooltip,
      isVisible,
      showTooltip,
      hideTooltip,
      showCursor,
      hideCursor,
      toggleCursor,
    }),
    [
      position,
      tooltip,
      isVisible,
      showTooltip,
      hideTooltip,
      showCursor,
      hideCursor,
      toggleCursor,
    ]
  );

  return (
    <CursorContext.Provider value={contextValue}>
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
      {(tooltip.visible || isTooltipExiting) && isVisible && !isTouchDevice && (
        <div
          ref={tooltipRef}
          className={`fixed bg-tooltip_bg_gradient border-2 border-[#268CFF] flex items-center justify-center px-[14px] py-[3px] rounded-full pointer-events-none z-[10000] transition-all ease-out duration-300 whitespace-nowrap drop-shadow-[0_4px_12px_rgba(16,80,153,0.7)] ${
            isTooltipExiting
              ? "animate-fade-out opacity-0"
              : "animate-fade-in opacity-100"
          }`}
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
