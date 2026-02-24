"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";

import type { Heading, SidebarSection } from "@/lib/mdx";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { TableOfContents } from "@/components/docs/TableOfContents";

interface DocsLayoutShellProps {
  nav: SidebarSection[];
  children: React.ReactNode;
}

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function collectHeadingsFromPage(): Heading[] {
  const root = document.getElementById("doc-page-export-content");
  if (!root) return [];

  const nodes = Array.from(root.querySelectorAll("h2[id], h3[id]"));
  return nodes.map((node) => {
    const level = node.tagName.toLowerCase() === "h2" ? 2 : 3;
    return {
      level,
      id: node.id,
      text: node.textContent?.trim() || "",
    } as Heading;
  });
}

export function DocsLayoutShell({ nav, children }: DocsLayoutShellProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);

  const pathSegments = useMemo(() => {
    const [, docs, ...rest] = pathname.split("/");
    if (docs !== "docs") return [];
    return rest.filter(Boolean);
  }, [pathname]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHeadings(collectHeadingsFromPage());
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, children]);

  return (
    <div className="min-h-screen" style={{ background: "#F1F3F7" }}>
      <div className="pt-16">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border"
              style={{ borderColor: "#e5e7eb", background: "#ffffff", color: "#19213D" }}
              aria-label="Open docs navigation"
            >
              <Menu size={18} />
            </button>

            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
              <Link href="/docs" style={{ color: "#6D758F" }} className="hover:underline">
                Docs
              </Link>
              {pathSegments.map((segment, index) => {
                const href = `/docs/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;
                return (
                  <span key={`${segment}-${index}`} className="inline-flex items-center gap-1">
                    <ChevronRight size={14} style={{ color: "#6D758F" }} />
                    {isLast ? (
                      <span style={{ color: "#149A9B" }} className="font-medium">
                        {formatSegment(segment)}
                      </span>
                    ) : (
                      <Link href={href} style={{ color: "#6D758F" }} className="hover:underline">
                        {formatSegment(segment)}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem] gap-6 min-h-[calc(100vh-8rem)]">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div
                className="sticky top-24 rounded-2xl p-5 border-r"
                style={{ background: "#F1F3F7", borderColor: "#e5e7eb" }}
              >
                <DocsSidebar nav={nav} />
              </div>
            </aside>

            <main className="min-w-0">
              <div
                className="rounded-2xl border px-4 sm:px-6 md:px-8 py-8 md:py-10"
                style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
              >
                <div className="max-w-3xl">{children}</div>

                {headings.length > 0 && (
                  <div
                    className="xl:hidden mt-10 pt-6 border-t"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    <TableOfContents headings={headings} />
                  </div>
                )}
              </div>
            </main>

            <aside className="hidden xl:block w-56 flex-shrink-0">
              {headings.length > 0 && (
                <div className="sticky top-24">
                  <TableOfContents headings={headings} />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close docs navigation overlay"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside
            className="relative h-full w-72 max-w-[85vw] p-4 border-r shadow-raised"
            style={{ background: "#F1F3F7", borderColor: "#e5e7eb" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: "#19213D" }}>
                Documentation
              </p>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border"
                style={{ borderColor: "#e5e7eb", color: "#19213D", background: "#ffffff" }}
                aria-label="Close docs navigation"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] overflow-y-auto pr-1">
              <DocsSidebar nav={nav} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
