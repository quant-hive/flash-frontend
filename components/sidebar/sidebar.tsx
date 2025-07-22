"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, History, Settings, LogOut, Menu, ChevronLeft, Zap, GitCompare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Compare", href: "/dashboard/compare", icon: GitCompare },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={cn(
          "fixed inset-y-0 z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static",
          isCollapsed ? "w-[72px]" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b border-border">
          <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
            {!isCollapsed && (
              <Link href="/dashboard" className="flex flex-col">
                <div className="flex items-center font-semibold">
                  <Zap className="h-6 w-6 text-yellow-400 mr-2" />
                  <span className="text-lg">Flash</span>
                </div>
                <span className="text-xs text-muted-foreground ml-[38px]">by QuantHive</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-400" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
              <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className={cn(
              "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground",
              isCollapsed && "justify-center px-2",
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  )
}
