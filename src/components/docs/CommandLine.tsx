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
      className={cn(
        "group relative flex items-center justify-between rounded-2xl px-5 py-4 my-6 overflow-hidden transition-all duration-300",
        "bg-[#F1F3F7] border border-[#D1D5DB]/30 shadow-sm hover:border-[#149A9B]/40 hover:shadow-md",
        className
      )}
    >
      <div className="relative flex items-center gap-4 min-w-0 flex-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#D1D5DB]/40 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:text-[#149A9B]">
          <Terminal size={15} className="text-[#6D758F]" />
        </div>

        <div className="flex items-center gap-2.5 min-w-0 font-mono text-[13.5px]">
          <span className="text-[#6D758F]/40 select-none font-bold">$</span>
          <span className="text-[#19213D] font-semibold truncate selection:bg-[#149A9B]/10 selection:text-[#149A9B]">
            {command}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        aria-label="Copy command"
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
          copied
            ? "bg-[#149A9B] text-white shadow-lg shadow-[#149A9B]/20 transform scale-105"
            : "bg-white text-[#6D758F] border border-[#D1D5DB]/50 shadow-sm hover:text-[#149A9B] hover:border-[#149A9B]/30 hover:shadow-md"
        )}
      >
        {copied ? (
          <>
            <Check size={13} className="stroke-[3.5]" />
            Copied
          </>
        ) : (
          <>
            <Copy size={13} className="stroke-[2.5]" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
