"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";

interface CommandLineProps {
  children: string;
  className?: string;
}

export function CommandLine({ children, className }: CommandLineProps) {
  const [copied, setCopied] = useState(false);

  const command = typeof children === "string" ? children.trim() : String(children ?? "").trim();

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn("flex items-center justify-between rounded-xl px-4 py-3 my-4 shadow-sunken", className)}
      style={{ background: "#002333" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Terminal size={14} style={{ color: "#149A9B", flexShrink: 0 }} />
        <span
          className="text-sm font-mono"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          $
        </span>
        <span
          className="text-sm font-mono truncate"
          style={{ color: "#a5f3fc" }}
        >
          {command}
        </span>
      </div>
      <button
        onClick={handleCopy}
        aria-label="Copy command"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ml-3 flex-shrink-0",
          "transition-all duration-200",
          copied ? "text-green-400" : "text-white/40 hover:text-white/80"
        )}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
