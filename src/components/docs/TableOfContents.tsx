"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { Heading } from "@/lib/mdx";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="flex flex-col gap-1">
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "#6D758F" }}
      >
        On this page
      </p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "text-sm transition-all duration-150 leading-snug py-0.5",
            heading.level === 3 && "pl-3",
            activeId === heading.id
              ? "font-medium"
              : "hover:opacity-80"
          )}
          style={{
            color: activeId === heading.id ? "#149A9B" : "#6D758F",
          }}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
