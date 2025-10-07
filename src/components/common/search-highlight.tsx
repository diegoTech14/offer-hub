"use client";

import React from "react";

interface SearchHighlightProps {
  text: string;
  highlight: string;
}

export default function SearchHighlight({ text, highlight }: SearchHighlightProps) {
  if (!highlight?.trim()) return <>{text}</>;

  // Escape special regex characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedHighlight})`, "gi");

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-400 text-black font-semibold rounded px-1">
            {part}
          </mark>

        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
