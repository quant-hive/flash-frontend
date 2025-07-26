"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  History,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  Zap,
  GitCompare,
  SlidersHorizontal,
  FlaskConical,
  Headset,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import Logo from "../logo";
import ProIcon from "../miscellaneous/pro-icon";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  // { name: "Compare", href: "/dashboard/compare", icon: GitCompare },
  { name: "Backtests", href: "/dashboard/backtest", icon: FlaskConical },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const handleUserDialog = () => {
    setIsUserDialogOpen((prev) => !prev);
  };

  return (
    <aside className="relative flex rounded-l-xl overflow-hidden h-full">
      <button
        className="absolute lg:hidden z-50 p-2 bg-background rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={cn(
          "absolute z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static h-full w-56 pr-0.5"
        )}
      >
        <div
          className={cn("flex flex-col justify-between pt-6 pb-4 pl-5 h-full")}
        >
          <div className="flex flex-col">
            <Link href="/dashboard" className="flex flex-col">
              <div className="flex items-center text-xl">
                Flash <sup className="text-[9px]">TM</sup>
              </div>
            </Link>
            {/* {isCollapsed && (
              <Link
                href="/dashboard"
                className="flex items-center justify-center"
              >
                <Logo />
              </Link>
            )} */}
            {/* <Button
              variant="ghost"
              size="sm"
              className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
              <span className="sr-only">
                {isCollapsed ? "Expand" : "Collapse"} Sidebar
              </span>
            </Button> */}

            <div className="flex-1 overflow-auto pl-0.5 pr-0.5 py-0.5 mt-3">
              <nav className="flex flex-col flex-1 gap-1.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md pl-4 py-1",
                      pathname === item.href
                        ? "bg-button-focus shadow-xl"
                        : "hover:bg-button-focus"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 mr-3")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                ))}

                <hr className="border-muted-foreground rounded-full mt-4" />

                <div className="mt-4 pl-0.5">
                  <Link
                    href="/support"
                    className={cn(
                      "flex items-center rounded-md pl-4 py-1 hover:bg-button-focus"
                    )}
                  >
                    <Headset className={cn("h-4 w-4 mr-3")} />
                    <span>Support</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col rounded-xl overflow-hidden border-2 border-[#2A2A2A] bg-[#222222] mb-8 shadow-lg">
              <div className="relative">
                <div className="absolute flex flex-col z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                  <span className="text-2xl">
                    Flash<sup className="text-[10px] -top-2.5">TM</sup>
                  </span>
                  <span className="text-nowrap font-light text-[8px] -mt-1.5">
                    by QuantHive
                  </span>
                </div>

                <div className="absolute w-full h-full bg-gradient-to-b from-[#001B3A] via-[#00142A]/[50%] to-[#00142A]/[0%]" />
                <img
                  src="/images/webp/interstellar-black-hole.webp"
                  alt="Interstellar Black Hole"
                  className="object-cover w-full"
                />
              </div>

              <div className="flex flex-col items-center justify-center px-2 py-2">
                <div className="flex flex-col text-center mb-2">
                  <span className="text-xs mt-1.5 mb-0.5">
                    You're now using Free Tier
                  </span>
                  <span className="text-[10px] text-[#838383] leading-tight">
                    Enjoy advanced features, beta versions, and prority tools in
                    the Pro Tier.
                  </span>
                </div>

                <div className="flex flex-row pt-1 items-center border-2 border-[#1E4979] rounded-lg mt-2 bg-gradient-to-br from-[#004797]/[30%] via-[#1B86FF]/[30%] to-[#003978]/[30%] w-full">
                  <div className="-ml-0.5">
                    <ProIcon width={60} height={48} />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-wider -mt-1 bg-clip-text   bg-pro_text_gradient text-transparent">
                      Discount - 50%
                    </span>
                    <span className="text-[0.74rem] text-[#4B6E93]">
                      For the first month
                    </span>
                  </div>
                </div>

                <Link
                  href="/plans"
                  className="w-full text-center text-sm bg-[#141414] hover:bg-[#070707] py-2 rounded-lg mt-2"
                >
                  See Plans
                </Link>
              </div>
            </div>

            <hr className="border-muted-foreground rounded-full mb-2" />

            <Popover open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex flex-row items-center justify-between hover:bg-button-focus rounded-xl w-full pl-2.5 pr-1.5 py-1.5 transition-all duration-300",
                    isUserDialogOpen &&
                      "backdrop:bg-black/50 backdrop:backdrop-blur-md"
                  )}
                >
                  <div className="w-7 h-7 rounded-full flex items-center bg-profile_gradient justify-center p-0.5">
                    <div className="bg-[#222222] h-full w-full rounded-full flex items-center justify-center">
                      <User />
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between">
                    <div className="text-sm">
                      {user?.username
                        ? user.username.length > 10
                          ? user.username.substring(0, 10) + "..."
                          : user.username
                        : ""}
                    </div>
                    <div className="text-xs text-[#838383] text-ellipsis overflow-hidden">
                      {user?.email
                        ? user.email.length > 10
                          ? user.email.substring(0, 12) + "..."
                          : user.email
                        : ""}
                    </div>
                  </div>

                  <ChevronUp
                    size={20}
                    className={cn(
                      "transition-transform duration-300",
                      isUserDialogOpen && "rotate-180"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">Dimensions</h4>
                    <p className="text-muted-foreground text-sm">
                      Set the dimensions for the layer.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        defaultValue="100%"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxWidth">Max. width</Label>
                      <Input
                        id="maxWidth"
                        defaultValue="300px"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        defaultValue="25px"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="maxHeight">Max. height</Label>
                      <Input
                        id="maxHeight"
                        defaultValue="none"
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </aside>
  );
}

const User = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#userIconGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-user-icon lucide-user"
    >
      <defs>
        <linearGradient id="userIconGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93C6FF" />
          <stop offset="31%" stopColor="#599BE6" />
          <stop offset="67%" stopColor="#93C6FF" />
          <stop offset="100%" stopColor="#467AB5" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="7" r="4" />
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    </svg>
  );
};
