"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { SidebarSection } from "@/lib/mdx";

interface DocsSidebarProps {
  nav: SidebarSection[];
}

export function DocsSidebar({ nav }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {nav.map((section) => (
        <div key={section.section}>
          {/* Section header */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2 px-3"
            style={{ color: "#6D758F" }}
          >
            {section.section}
          </p>

          {/* Links */}
          <ul className="flex flex-col gap-0.5">
            {section.links.map((link) => {
              const href = `/docs/${link.slug}`;
              const isActive = pathname === href;

              return (
                <li key={link.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "block px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "shadow-sunken-subtle"
                        : "hover:shadow-raised-sm"
                    )}
                    style={{
                      color: isActive ? "#149A9B" : "#19213D",
                      background: "#F1F3F7",
                    }}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
