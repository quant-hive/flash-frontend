/* ---------------------- New Navbar ------------------------ 
This a new navbar component that is being created.
It is a placeholder for now and will be updated later.
It will be used in the main page of the website.
-------------------------------------------------------------
*/

"use client";

import React, { useEffect, useRef, useState } from "react";
import Logo from "../logo";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Menu from "../menu";
import { navItems } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";

const NavbarItems = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <motion.div
      className="relative flex items-center"
      initial="initial"
      animate="visible"
      variants={{
        initial: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.6,
          },
        },
      }}
    >
      {navItems.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 10, filter: "blur(8px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.3 },
            },
          }}
        >
          <Link
            href={item.href}
            className="relative px-1.5 py-[3px] md:px-2.5 md:py-1 flex flex-row"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-foreground text-base md:text-lg font-normal whitespace-nowrap">
              <span className="relative">
                {item.label}

                {hoveredItem === index && (
                  <motion.div
                    className="absolute -bottom-[1px] md:-bottom-0.5 left-0 right-0 h-[1px] md:h-0.5 bg-foreground rounded-full"
                    layoutId="navbar-underline"
                  />
                )}
              </span>

              {item.hasTrademark && (
                <sup className="text-[8px] md:text-[10px] ml-0.5">TM</sup>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Combined click outside handler for both navbar and menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside both navbar and menu
      const isOutsideNav = navRef.current && !navRef.current.contains(target);
      const isOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);

      // If menu is open and click is outside both components, close it
      if (isOpen && isOutsideNav && isOutsideMenu) {
        setIsOpen(false);
      }
    };

    // Only add listener when menu is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <>
      <header
        ref={navRef}
        className="absolute top-5 -translate-x-1/2 left-1/2 z-50"
      >
        <motion.nav
          initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            opacity: { duration: 0.2 },
            scale: { duration: 0.3 },
          }}
          style={{ transformOrigin: "center" }}
          className={`${
            isOpen ? "scale-105" : "hover:scale-105"
          } w-fit transition-all duration-300 flex items-center justify-center bg-[#0A0A0A] rounded-full border-2 border-[#282828] py-1 px-[14px] md:py-2 md:px-5 select-none`}
        >
          <div className="w-5 h-5 md:w-7 md:h-7 mr-3 mt-0.5 md:mt-1 flex items-center justify-center">
            <Logo />
          </div>

          <NavbarItems />

          <button
            onClick={() => {
              isOpen ? setIsOpen(false) : setIsOpen(true);
            }}
            className={`text-foreground text-lg ml-1.5 ${
              isOpen ? "scale-125" : "hover:scale-125"
            } transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            {isMobile ? (
              <ChevronDown strokeWidth={"2.5"} size={"20"} />
            ) : (
              <ChevronDown strokeWidth={"2.5"} size={"24"} />
            )}
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {isOpen && (
          <div
            ref={menuRef}
            className="top-14 md:top-[72px] absolute -translate-x-1/2 left-1/2 w-full flex flex-row items-center justify-center z-50"
          >
            <Menu />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
