import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the current device has touch capabilities
 * @returns boolean indicating if the device supports touch
 */
export const useTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    const detectTouchDevice = () => {
      // Multiple ways to detect touch capability for better accuracy
      const hasTouch =
        "ontouchstart" in window || // Touch events support
        navigator.maxTouchPoints > 0 || // Modern touch points detection
        (navigator as any).msMaxTouchPoints > 0 || // Legacy IE touch detection
        window.matchMedia("(pointer: coarse)").matches; // CSS media query for coarse pointer (touch)

      setIsTouchDevice(hasTouch);
    };

    // Initial detection
    detectTouchDevice();

    // Listen for media query changes (useful for devices that can switch between touch/mouse)
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleMediaChange = () => detectTouchDevice();

    // Add listener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }

    // Also listen for touch events to dynamically detect touch usage
    const handleTouchStart = () => {
      if (!isTouchDevice) {
        setIsTouchDevice(true);
      }
    };

    // Listen for first touch to catch devices that might not be detected initially
    document.addEventListener("touchstart", handleTouchStart, {
      once: true,
      passive: true,
    });

    return () => {
      // Cleanup listeners
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isTouchDevice]);

  return isTouchDevice;
};
