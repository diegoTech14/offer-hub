"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/mdx";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Collect all intersecting entries
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          // If we are at the bottom of the page, the last visible entry should be active
          const isAtBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

          if (isAtBottom) {
            setActiveId(visibleEntries[visibleEntries.length - 1].target.id);
          } else {
            // Otherwise, pick the one closest to our top margin (100px)
            setActiveId(visibleEntries[0].target.id);
          }
        }
      },
      {
        rootMargin: "-100px 0px -40% 0px",
        threshold: [0, 1],
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Handle scroll to bottom explicitly to catch the last items
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom && headings.length > 0) {
        setActiveId(headings[headings.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden md:block w-full max-w-[240px]">
      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-primary mb-4">
          On this page
        </p>
        <ul className="flex flex-col gap-3">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? "pl-3" : ""}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`text-sm transition-colors duration-200 block leading-tight ${activeId === heading.id
                  ? "text-primary font-semibold"
                  : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
