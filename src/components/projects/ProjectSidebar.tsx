"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, Search, FolderCog, Wallet, MessageSquare, LogOut } from "lucide-react"

const items = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/projects" },
  { icon: PlusCircle, label: "Create project", href: "/projects/new" },
  { icon: Search, label: "Search Talent", href: "/talent" },
  { icon: FolderCog, label: "My Projects", href: "/projects/mine" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Sidebar" className="h-full flex flex-col justify-between">
      <ul className="p-4 space-y-2">
        {items.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <li key={label}>
              <Link
                href={href}
                className={[
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:bg-slate-50",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
