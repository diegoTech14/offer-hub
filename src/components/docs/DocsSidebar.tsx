"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarSection } from "@/lib/mdx";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DocsSidebarProps {
  nav: SidebarSection[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DocsSidebar({ nav, className }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Auto-expand section containing active page on mount and pathname change
  useEffect(() => {
    if (!nav || nav.length === 0) return;

    // Find section containing active page
    const activeSectionLabel = nav.find((section) =>
      section.links.some((link) => pathname === `/docs/${link.slug}`)
    )?.section;

    // If found, expand only that section. Otherwise, expand first section.
    const sectionToExpand = activeSectionLabel || nav[0]?.section;

    if (sectionToExpand) {
      setExpandedSections(new Set([sectionToExpand]));
    }
  }, [pathname, nav]);

  // Toggle section expand/collapse
  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionLabel)) {
        next.delete(sectionLabel);
      } else {
        next.add(sectionLabel);
      }
      return next;
    });
  };

  // Handle empty or missing nav
  if (!nav || nav.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Documentation navigation"
      className={cn("w-full", className)}
      style={{ background: "#F1F3F7" }}
    >
      <div className="space-y-6">
        {nav.map((section) => {
          // Skip empty sections
          if (!section.links || section.links.length === 0) {
            return null;
          }

          const isExpanded = expandedSections.has(section.section);
          const sectionId = `section-${section.section.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <div key={section.section}>
              {/* Section Header Button */}
              <button
                onClick={() => toggleSection(section.section)}
                aria-expanded={isExpanded}
                aria-controls={sectionId}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${section.section} section`}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-[400ms] ease-out hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#149A9B] focus-visible:ring-offset-2"
                style={{ background: "transparent" }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#19213D" }}
                >
                  {section.section}
                </span>
                <ChevronDown
                  size={16}
                  className="transition-transform duration-[400ms] ease-out"
                  style={{
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    color: "#6D758F",
                  }}
                />
              </button>

              {/* Collapsible Links */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.ul
                    id={sectionId}
                    role="list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="overflow-hidden mt-2 space-y-1"
                  >
                    {section.links.map((link) => {
                      const href = `/docs/${link.slug}`;
                      const isActive = pathname === href;
                      const linkKey = `${section.section}-${link.slug}`;

                      return (
                        <li key={linkKey} role="listitem">
                          <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "block text-sm py-1.5 px-3 rounded-lg transition-all duration-[400ms] ease-out",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#149A9B] focus-visible:ring-offset-2",
                              isActive && "border-l-2"
                            )}
                            style={{
                              color: isActive ? "#149A9B" : "#6D758F",
                              backgroundColor: isActive
                                ? "rgba(20, 154, 155, 0.06)"
                                : "transparent",
                              borderLeftColor: isActive ? "#149A9B" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.color = "#19213D";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.color = "#6D758F";
                              }
                            }}
                          >
                            {link.title}
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
