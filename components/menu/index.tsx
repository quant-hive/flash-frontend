import { menuItems } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";
import { StaggerIcon } from "../stagger-icon";
import { useIsMobile } from "@/hooks/use-mobile";

const Menu = () => {
  const isMobile = useIsMobile();
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();

    if (query === "") {
      setFilteredMenuItems(menuItems);
      return;
    }

    const filtered = menuItems
      .map((section) => {
        const filteredSection: any = {};

        Object.entries(section).forEach(([sectionTitle, items]) => {
          const matchingItems = items.filter((item: any) =>
            item.title.toLowerCase().includes(query)
          );

          if (matchingItems.length > 0) {
            filteredSection[sectionTitle] = matchingItems;
          }
        });

        return filteredSection;
      })
      .filter((section) => Object.keys(section).length > 0);

    setFilteredMenuItems(filtered);
  };

  return (
    <motion.menu
      key="menu"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute lg:max-w-[984px] md:max-w-[724px] sm:max-w-[600px] max-sm:left-6 max-sm:right-6 max-sm:w-auto w-full top-full mt-6 bg-[#0A0A0A]/[5%] border-2 border-[#2A2A2A] rounded-xl pt-5 md:pt-10 px-7 pb-10 md:px-9 md:pb-14 z-10 backdrop-blur-[18px]"
    >
      <input
        type="text"
        autoFocus
        onChange={onSearch}
        className="bg-transparent border-b-[1px] md:border-b-[0.1em] border-[#262626] w-full focus:outline-none placeholder:text-[#5E5E5E] text-lg md:text-xl font-semibold pb-0.5 md:pb-1 px-[1px] md:px-0.5"
        placeholder="Search"
      />

      {filteredMenuItems.map((section, index) => (
        <div key={index} className="mt-7 md:mt-11 select-none">
          {Object.entries(section).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-5">
                {title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 md:gap-y-6">
                {items.map((item: any, index: number) => (
                  <Link href={item.href} key={index} className="group">
                    <motion.div
                      initial="initial"
                      whileHover="hovered"
                      className={`flex items-center ${
                        (index + 1) % 3 == 0
                          ? "lg:justify-end"
                          : "lg:justify-start"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-[112px] h-[62px] md:w-[136px] md:h-[72px] border-2 border-[#2A2A2A] rounded-lg"
                      />

                      <div className="flex flex-col ml-4">
                        <span className="flex items-end text-xl md:text-2xl font-semibold text-[#5E5E5E] -mb-1">
                          {item.number}
                        </span>

                        <div className="flex items-start">
                          <div className="relative flex flex-row group">
                            <div className="flex flex-row items-end justify-center text-foreground">
                              <p className="text-xl md:text-2xl font-normal whitespace-nowrap">
                                <span className="group-hover:underline underline-offset-4">
                                  {item.title}
                                </span>
                                {item.hasTradeMark && (
                                  <span className="relative -top-1 mr-1 ml-0.5 leading-none">
                                    <sup className="text-[8px] md:text-[10px]">
                                      TM
                                    </sup>
                                  </span>
                                )}
                              </p>
                              {isMobile ? (
                                <StaggerIcon
                                  icon={ArrowUpRight}
                                  size={20}
                                  duration={0.25}
                                  className="h-fit mb-0.5 -ml-0.5"
                                />
                              ) : (
                                <StaggerIcon
                                  icon={ArrowUpRight}
                                  size={24}
                                  duration={0.25}
                                  className="h-fit mb-0.5 -ml-0.5"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      {filteredMenuItems.length === 0 && (
        <div className="mt-6 text-xl text-center text-parimary">
          No items found
        </div>
      )}
    </motion.menu>
  );
};

export default Menu;
