"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const code = typeof children === "string" ? children : String(children ?? "");

  async function handleCopy() {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden shadow-sunken my-6", className)}
      style={{ background: "#002333" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span
          className="text-xs font-mono font-medium tracking-wide uppercase"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {language ?? "code"}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
            "transition-all duration-200",
            copied
              ? "text-green-400"
              : "text-white/40 hover:text-white/80"
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0">
        <code style={{ color: "#a5f3fc", fontFamily: "ui-monospace, monospace" }}>
          {code.trim()}
        </code>
      </pre>
    </div>
  );
}
