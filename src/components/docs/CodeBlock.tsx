"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code?: string;
  children?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({
  code: codeProp,
  children,
  language = "typescript",
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");

  const rawCode = (codeProp || children || "").trim();

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      try {
        const html = await codeToHtml(rawCode, {
          lang: language,
          theme: "one-dark-pro", // Tema con mejor contraste y colores más vibrantes
        });
        if (isMounted) {
          setHighlightedCode(html);
        }
      } catch (error) {
        console.error("Shiki highlighting failed:", error);
        if (isMounted) {
          setHighlightedCode(`<pre><code>${rawCode}</code></pre>`);
        }
      }
    }
    highlight();
    return () => {
      isMounted = false;
    };
  }, [rawCode, language]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden my-6 border border-white/10 group shadow-2xl",
        className
      )}
      style={{ background: "#0f172a" }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span
          className="text-xs font-semibold uppercase tracking-wider font-mono"
          style={{ color: "#6D758F" }}
        >
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="relative flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#149A9B]/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={14} className="text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy
                  size={14}
                  className="transition-colors duration-200"
                  style={{ color: "#149A9B" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto text-sm leading-relaxed min-h-[3rem]">
        {highlightedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="shiki-container [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!outline-none [&_span]:!text-[inherit] shiki-vibrant"
          />
        ) : (
          <pre className="text-slate-400 animate-pulse">
            <code>{rawCode}</code>
          </pre>
        )}
      </div>

      <style jsx global>{`
        .shiki-container pre {
          color: #e2e8f0; /* Color base claro por si el tema falla */
        }
        .shiki-vibrant span {
          filter: brightness(1.2); /* Aumenta ligeramente el brillo de los tokens */
        }
      `}</style>
    </div>
  );
}
