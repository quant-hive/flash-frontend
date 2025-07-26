import { Bell, Ellipsis, Search, X } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const ActionBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback((query: string) => {
    if (query.trim()) {
      console.log("Performing search:", query);
      // Add your search logic here
      // e.g., API call, filtering, etc.
    }
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer if there's a search value
    if (searchValue.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchValue);
      }, 500);
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue, performSearch]);

  const handleSearchClick = () => {
    if (isSearchOpen && inputRef.current) {
      // If already open, just focus the input
      inputRef.current.focus();
    } else {
      // If closed, open it
      setIsSearchOpen(true);
    }
  };

  const handleSearchClose = () => {
    if (searchValue) {
      setSearchValue("");
      inputRef.current?.focus();
    } else {
      setIsSearchOpen(false);
      // Focus on the search button after closing
      setTimeout(() => {
        if (searchButtonRef.current) {
          searchButtonRef.current.focus();
        }
      }, 100);
    }
  };

  const handleInputBlur = () => {
    // Use setTimeout to allow focus to move to other elements in the container
    setTimeout(() => {
      if (
        !searchContainerRef.current?.contains(document.activeElement) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
        setSearchValue("");
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Clear debounce timer and perform immediate search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      performSearch(searchValue);
    }
    if (e.key === "Escape") {
      handleSearchClose();
    }
  };

  return (
    <motion.section
      layout
      className="flex flex-row gap-[18px] h-9 items-center justify-start mb-4"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        layout
        className="bg-card flex items-center justify-center h-full w-10 rounded-lg"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <span className="text-[26px] -mt-0.5 select-none">Q</span>
      </motion.div>

      {/* Search Button/Input */}
      {!isSearchOpen ? (
        <motion.button
          ref={searchButtonRef}
          layoutId="search-container"
          onClick={handleSearchClick}
          className="bg-card flex items-center justify-center h-full px-3 rounded-lg gap-2.5 hover:bg-card/70"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
            <Search size={16} />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="font-light select-none"
          >
            Search
          </motion.span>
        </motion.button>
      ) : (
        <motion.div
          ref={searchContainerRef}
          onClick={() => inputRef.current?.focus()}
          onMouseDown={(e) => e.preventDefault()}
          layoutId="search-container"
          className="bg-card flex items-center h-full px-3 rounded-lg gap-2.5 w-72"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            layout
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.focus()}
            className="cursor-pointer"
          >
            <Search size={16} />
          </motion.div>
          <motion.input
            ref={inputRef}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder="Search..."
            className="flex-1 bg-transparent font-light outline-none placeholder:text-input"
          />
          <button
            tabIndex={0}
            onClick={handleSearchClose}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchClose();
              }
            }}
            className="text-input hover:text-foreground transition-colors duration-200 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white rounded focus:outline-none"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      <motion.div
        layout
        className="w-[3px] h-[80%] bg-card rounded-full"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      <motion.button
        layout
        className="bg-card flex items-center justify-center h-full px-3 rounded-lg gap-2.5 hover:bg-card/70"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Bell size={16} />
        <span className="font-light select-none">Notifications</span>
      </motion.button>

      <motion.button
        layout
        className="bg-card flex items-center justify-center h-full px-3 rounded-lg hover:bg-card/70"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Ellipsis />
      </motion.button>
    </motion.section>
  );
};

export default ActionBar;
