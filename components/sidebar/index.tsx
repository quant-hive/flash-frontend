"use client";

import { Fragment, use, useEffect, useRef, useState } from "react";
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
  LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import ProIcon from "../miscellaneous/pro-icon";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import CustomPopoverContent from "../custom-popover-content";
import { backtestService } from "@/lib/backtest-service";
import { useDashboardContext } from "@/context/dashboard";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  // { name: "Compare", href: "/dashboard/compare", icon: GitCompare },
  {
    name: "Backtest",
    href: "/backtest",
    icon: FlaskConical,
    items: [
      { name: "Overview", href: "/backtest/results/[id]/overview" },
      { name: "Trades", href: "/backtest/results/[id]/trades" },
      { name: "Performance", href: "/backtest/results/[id]/performance" },
      { name: "Strategy", href: "/backtest/results/[id]/strategy" },
    ],
  },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { latestBacktest, setLatestBacktest } = useDashboardContext();

  // Fill a template path like "/a/[id]/b/[slug]" from the currentPath by position
  const fillTemplateFromPath = (templateHref: string, currentPath: string) => {
    const tSegs = templateHref.split("/").filter(Boolean);
    const cSegs = currentPath.split("/").filter(Boolean);
    if (cSegs.length < tSegs.length) return null;

    const out: string[] = [];
    for (let i = 0; i < tSegs.length; i++) {
      const t = tSegs[i];
      const c = cSegs[i];
      if (/^\[[^/]+\]$/.test(t)) {
        if (!c) return null;
        out.push(c);
      } else if (t === c) {
        out.push(c);
      } else {
        // static segment mismatch; cannot reliably fill
        return null;
      }
    }
    return "/" + out.join("/");
  };

  // Helper: resolve dynamic params like [id] in sidebar subitem hrefs (generic, non-domain-specific)
  const resolveSubHrefGeneric = (
    templateHref: string,
    parentHref: string,
    currentPath: string
  ) => {
    if (!templateHref) return templateHref;

    const hasDynamic = /\[[^/]+?\]/.test(templateHref);
    if (!hasDynamic) return templateHref;

    // 1) Try to fill from the current path by aligning segments
    const filledFromPath = fillTemplateFromPath(templateHref, currentPath);
    if (filledFromPath) return filledFromPath;

    // 2) Fallback: navigate to base static prefix before first dynamic segment or parent
    const parts = templateHref.split("/");
    const baseParts: string[] = [];
    for (const seg of parts) {
      if (!seg) continue;
      if (/\[[^/]+?\]/.test(seg)) break;
      baseParts.push(seg);
    }
    const basePath = "/" + baseParts.join("/");
    return parentHref || basePath || "/";
  };

  // Backtest-only resolver: handles /backtest paths using latestBacktest id when needed
  const resolveBacktestHref = (
    templateHref: string,
    parentHref: string,
    currentPath: string
  ) => {
    if (!templateHref) return templateHref;

    const hasDynamic = /\[[^/]+?\]/.test(templateHref);
    if (!hasDynamic) return templateHref;

    // 1) Attempt to align with current path (useful when already within a backtest route)
    const filledFromPath = fillTemplateFromPath(templateHref, currentPath);
    if (filledFromPath) return filledFromPath;

    // 2) Use latestBacktest id for [id]
    if (templateHref.includes("[id]")) {
      const id = (latestBacktest as any)?.backtest_id;
      if (id) return templateHref.replace("[id]", id);
    }

    // 3) Fallback to static base or parent
    const parts = templateHref.split("/");
    const baseParts: string[] = [];
    for (const seg of parts) {
      if (!seg) continue;
      if (/\[[^/]+?\]/.test(seg)) break;
      baseParts.push(seg);
    }
    const basePath = "/" + baseParts.join("/");
    return parentHref || basePath || "/";
  };

  // Helper: check if current path matches a template with dynamic segments like [id]
  const isTemplatePathActive = (templateHref: string, currentPath: string) => {
    if (!templateHref) return false;
    const TOKEN = "__DYN__";
    // Replace all [param] with a token, escape the rest, then swap token for a wildcard segment
    const pre = templateHref.replace(/\[[^/]+?\]/g, TOKEN);
    const escaped = pre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern =
      "^" + escaped.replace(new RegExp(TOKEN, "g"), "[^/]+") + "(?:$|/)?";
    try {
      return new RegExp(pattern).test(currentPath);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    backtestService
      .getUserBacktests()
      .then((backtests) => {
        const last = backtests[backtests.length - 1] || null;
        setLatestBacktest(last);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setLatestBacktest]);

  if (loading) {
    return (
      <aside className={`flex rounded-l-xl overflow-hidden h-full`}>
        <div
          className={cn(
            "z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static h-full w-56 pr-0.5 justify-between pt-4 pb-4 pl-5"
          )}
        >
          <div className="flex flex-col">
            <div className="flex items-center text-xl select-none">
              Flash <sup className="text-[9px]">TM</sup>
            </div>

            <div className="flex-1 overflow-auto pl-0.5 pr-0.5 py-0.5 mt-3">
              <div className="relative w-full transition-all duration-300 ease-in-out">
                <nav className="flex flex-col flex-1 gap-1.5">
                  {/* Navigation skeleton items */}
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center rounded-md pl-4 py-1 animate-pulse">
                        <div className="h-4 w-4 mr-3 bg-muted rounded"></div>
                        <div className="h-4 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}

                  <hr className="border-muted-foreground rounded-full mt-4" />

                  <div className="mt-4 pl-0.5">
                    <div className="flex items-center rounded-md pl-4 py-1 animate-pulse">
                      <div className="h-4 w-4 mr-3 bg-muted rounded"></div>
                      <div className="h-4 w-16 bg-muted rounded"></div>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Pro tier promotion skeleton */}
            <div className="flex flex-col rounded-xl overflow-hidden border-2 border-[#2A2A2A] bg-[#222222] mb-8 shadow-lg select-none animate-pulse">
              <div className="relative">
                <div className="absolute flex flex-col z-10 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                  <div className="h-6 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
                <div className="absolute w-full h-full bg-gradient-to-b from-[#001B3A] via-[#00142A]/[50%] to-[#00142A]/[0%]" />
                <div className="w-full h-20 bg-muted"></div>
              </div>

              <div className="flex flex-col items-center justify-center px-1.5 pt-1 pb-1">
                <div className="flex flex-col text-center">
                  <div className="h-4 w-32 bg-muted rounded mt-1.5 mb-0.5"></div>
                  <div className="h-3 w-40 bg-muted rounded"></div>
                </div>

                <div className="flex flex-row pt-1 items-center border border-[#1E4979] rounded-lg mt-3 bg-gradient-to-br from-[#004797]/[30%] via-[#1B86FF]/[30%] to-[#003978]/[30%] w-full">
                  <div className="-ml-0.5 w-14 h-10 bg-muted rounded"></div>
                  <div className="flex flex-col">
                    <div className="h-4 w-20 bg-muted rounded mb-1"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </div>

                <div className="w-full h-8 bg-muted rounded-lg mt-1.5"></div>
              </div>
            </div>

            <hr className="border-muted-foreground rounded-full mb-2" />

            {/* User profile skeleton */}
            <div className="flex flex-row items-center justify-between rounded-xl w-full pl-2.5 pr-1.5 py-1.5 animate-pulse">
              <div className="flex flex-row items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="flex flex-col items-start justify-between">
                  <div className="h-4 w-16 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
              </div>
              <div className="w-5 h-5 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`flex rounded-l-xl overflow-hidden h-full`}>
      {/* <button
        className="absolute lg:hidden z-50 p-2 bg-background rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button> */}
      <div
        className={cn(
          "z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static h-full w-56 pr-0.5 justify-between pt-4 pb-4 pl-5"
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center text-xl select-none">
            Flash <sup className="text-[9px]">TM</sup>
          </div>
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
            <div className="relative w-full transition-all duration-300 ease-in-out">
              <nav className="flex flex-col flex-1 gap-1.5">
                {isAdmin && (
                  <div className="mb-2">
                    <Link
                      href="/admin"
                      className={cn(
                        "flex items-center rounded-md pl-4 py-1 hover:bg-button-focus",
                        pathname === "/admin" || pathname.startsWith("/admin")
                          ? "bg-button-focus shadow-xl"
                          : ""
                      )}
                    >
                      <LockKeyhole className={cn("h-4 w-4 mr-3")} />
                      <span>Admin</span>
                    </Link>
                    <hr className="border-muted-foreground rounded-full mt-4" />
                  </div>
                )}
                {navigation.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md pl-4 py-1",
                        pathname === item.href || pathname.startsWith(item.href)
                          ? "bg-button-focus shadow-xl"
                          : "hover:bg-button-focus"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 mr-3")} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                    {(pathname === item.href ||
                      pathname.startsWith(item.href)) &&
                      item.items && (
                        <div className="flex flex-col rounded-md mt-1 ml-3 bg-card p-1">
                          {item.items.map((subItem) => {
                            const active =
                              isTemplatePathActive(subItem.href, pathname) ||
                              (!/\[[^/]+?\]/.test(subItem.href) &&
                                (pathname === subItem.href ||
                                  pathname.startsWith(subItem.href)));

                            const subHref = subItem.href.startsWith("/backtest")
                              ? resolveBacktestHref(
                                  subItem.href,
                                  item.href,
                                  pathname
                                )
                              : resolveSubHrefGeneric(
                                  subItem.href,
                                  item.href,
                                  pathname
                                );

                            return (
                              <Link
                                key={subItem.name}
                                href={subHref}
                                className={cn(
                                  "flex items-center rounded-md pl-4 py-1",
                                  active
                                    ? "bg-button-focus shadow-xl"
                                    : "hover:bg-button-focus"
                                )}
                              >
                                {!isCollapsed && <span>{subItem.name}</span>}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                  </div>
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
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col rounded-xl overflow-hidden border-2 border-[#2A2A2A] bg-[#222222] mb-8 shadow-lg select-none">
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

            <div className="flex flex-col items-center justify-center px-1.5 pt-1 pb-1">
              <div className="flex flex-col text-center">
                <span className="text-xs mt-1.5 mb-0.5">
                  You're now using Free Tier
                </span>
                <span className="text-[10px] text-[#838383] leading-tight text-balance">
                  Enjoy advanced features, beta versions, and prority tools in
                  the Pro Tier.
                </span>
              </div>

              <div className="flex flex-row pt-1 items-center border border-[#1E4979] rounded-lg mt-3 bg-gradient-to-br from-[#004797]/[30%] via-[#1B86FF]/[30%] to-[#003978]/[30%] w-full">
                <div className="-ml-0.5">
                  <ProIcon width={54} height={42} />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wider -mt-1 bg-clip-text bg-pro_text_gradient text-transparent">
                    Discount - 50%
                  </span>
                  <span className="text-[0.74rem] text-[#4B6E93]">
                    For the first month
                  </span>
                </div>
              </div>

              <Link
                href="/plans"
                className="w-full text-center text-sm bg-[#141414] hover:bg-[#070707] py-2 rounded-lg mt-1.5"
              >
                See Plans
              </Link>
            </div>
          </div>

          <hr className="border-muted-foreground rounded-full mb-2" />

          <Popover open={isUserPopoverOpen} onOpenChange={setIsUserPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "relative z-10 flex flex-row items-center justify-between hover:bg-button-focus rounded-xl w-full pl-2.5 pr-1.5 py-1.5 transition-all duration-300"
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center bg-blue_accent_gradient justify-center p-0.5">
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
                </div>

                <ChevronUp
                  size={20}
                  className={cn(
                    "transition-transform duration-300",
                    isUserPopoverOpen && "rotate-180"
                  )}
                />
              </button>
            </PopoverTrigger>
            <CustomPopoverContent>
              <div className="flex flex-col w-full gap-1">
                <div className="flex items-center justify-center w-full px-2 py-1 hover:bg-primary/5 rounded-md">
                  <Link
                    href="/profile"
                    className="flex w-full font-semibold bg-clip-text text-transparent bg-blue_accent_gradient hover:decoration-blue-400"
                  >
                    My Profile
                  </Link>
                </div>

                <div className="flex items-center justify-center w-full px-2 py-1 hover:bg-primary/5 rounded-md">
                  <Link
                    href="/notifications"
                    className="flex w-full font-semibold bg-clip-text text-transparent bg-blue_accent_gradient hover:decoration-blue-400"
                  >
                    Notifications
                  </Link>
                </div>

                <div className="flex items-center justify-center w-full px-2 py-1 hover:bg-primary/5 rounded-md">
                  <Link
                    href="/notifications"
                    className="flex w-full font-semibold bg-clip-text text-transparent bg-blue_accent_gradient hover:decoration-blue-400"
                  >
                    Data & Privacy
                  </Link>
                </div>

                <div className="mb-4 flex items-center justify-center w-full px-2 py-1 hover:bg-primary/5 rounded-md">
                  <Link
                    href="/notifications"
                    className="flex w-full font-semibold bg-clip-text text-transparent bg-blue_accent_gradient hover:decoration-blue-400"
                  >
                    Other Settings
                  </Link>
                </div>

                <div className="mb-3 h-0.5 rounded-full bg-blue_accent_gradient_90deg" />

                <Button
                  className="w-full flex flex-row justify-between bg-logout_gradient hover:bg-logout_gradient_light font-semibold h-8 px-3 focus-visible:ring-white"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  <span className="font-semibold bg-clip-text text-transparent bg-blue_accent_gradient">
                    Logout
                  </span>
                  <Power />
                </Button>
              </div>
            </CustomPopoverContent>
          </Popover>
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

const Power = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#powerIconGradient)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-power-icon lucide-power"
    >
      <defs>
        <linearGradient
          id="powerIconGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#93C6FF" />
          <stop offset="31%" stopColor="#599BE6" />
          <stop offset="67%" stopColor="#93C6FF" />
          <stop offset="100%" stopColor="#467AB5" />
        </linearGradient>
      </defs>
      <path stroke="lightblue" d="M12 4v8" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
    </svg>
  );
};
