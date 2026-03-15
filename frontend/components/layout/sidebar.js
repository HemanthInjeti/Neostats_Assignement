"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeAlert, BarChart3, ClipboardList, FileText, Home, Vote } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["staff", "secretariat", "case_manager", "admin"] },
  { href: "/submit-case", label: "Submit Case", icon: BadgeAlert, roles: ["staff"] },
  { href: "/cases", label: "Cases", icon: ClipboardList, roles: ["staff", "secretariat", "case_manager"] },
  { href: "/polls", label: "Polls", icon: Vote, roles: ["staff", "secretariat"] },
  { href: "/public-hub", label: "Public Hub", icon: FileText, roles: ["staff", "secretariat"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["secretariat", "admin"] }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));
  const dashboardTitle = user?.role === "staff" ? "Staff Voice Hub" : "NeoConnect";

  return (
    <aside className="flex min-h-screen w-full max-w-72 flex-col border-r border-white/10 bg-slate-950 text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">NeoConnect</p>
        <h1 className="mt-2 text-2xl font-semibold">{dashboardTitle}</h1>
        <p className="mt-2 text-sm text-slate-300">{user?.name} - {user?.role?.replace("_", " ")}</p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition",
                pathname === item.href ? "bg-emerald-400 text-slate-950" : "hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
