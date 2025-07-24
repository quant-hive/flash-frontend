import { Bell, Ellipsis, Search, X } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const ActionBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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
    setSearchValue("");
    setIsSearchOpen(false);
  };

  const handleInputBlur = () => {
    // Only close if there's no search value and input loses focus
    if (searchValue === "") {
      setIsSearchOpen(false);
    }
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
        <span className="text-[26px] -mt-0.5">Q</span>
      </motion.div>

      {/* Search Button/Input */}
      {!isSearchOpen ? (
        <motion.button
          layoutId="search-container"
          onClick={handleSearchClick}
          className="bg-card flex items-center justify-center h-full px-3 rounded-lg gap-2.5 hover:bg-card/70"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
            <Search size={16} />
          </motion.div>
          <span className="text-lg font-light">Search</span>
        </motion.button>
      ) : (
        <motion.div
          layoutId="search-container"
          className="bg-card flex items-center h-full px-3 rounded-lg gap-2.5 w-72"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <button
            onClick={handleSearchClick}
            className="text-input hover:text-foreground transition-colors duration-200"
          >
            <motion.div
              layout
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Search size={16} />
            </motion.div>
          </button>
          <motion.input
            initial="initial"
            animate="visible"
            variants={{
              initial: { opacity: 0, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 0.3 },
              },
            }}
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder="Search..."
            className="flex-1 bg-transparent text-lg font-light outline-none placeholder:text-input"
          />
          <button
            onClick={handleSearchClose}
            className="text-input hover:text-foreground transition-colors duration-200"
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
        <span className="text-lg font-light">Notifications</span>
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
