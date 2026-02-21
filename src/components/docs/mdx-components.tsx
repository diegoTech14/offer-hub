import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { CommandLine } from "./CommandLine";
import { Badge } from "./Badge";

export const MDX_COMPONENTS: MDXComponents = {
  // ── Custom doc components (used directly in .mdx files) ──
  CodeBlock,
  Callout,
  CommandLine,
  Badge,

  // ── Prose element overrides ──

  // Headings — add id for TOC anchor linking
  h2: ({ children, ...props }) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        className="text-2xl font-bold mt-10 mb-4 scroll-mt-20"
        style={{ color: "#19213D" }}
        {...props}
      >
        {children}
      </h2>
    );
  },

  h3: ({ children, ...props }) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return (
      <h3
        id={id}
        className="text-lg font-semibold mt-7 mb-3 scroll-mt-20"
        style={{ color: "#19213D" }}
        {...props}
      >
        {children}
      </h3>
    );
  },

  // Paragraph
  p: ({ children }) => (
    <p className="leading-7 mb-4" style={{ color: "#19213D" }}>
      {children}
    </p>
  ),

  // Inline code
  code: ({ children }) => (
    <code
      className="px-1.5 py-0.5 rounded-md text-[0.875em] font-mono"
      style={{ background: "rgba(20,154,155,0.1)", color: "#149A9B" }}
    >
      {children}
    </code>
  ),

  // Fenced code block — pre wraps code
  pre: ({ children }) => {
    // children is a <code> element; extract text and language
    const codeEl = children as React.ReactElement<{ className?: string; children?: string }>;
    const lang = codeEl?.props?.className?.replace("language-", "") ?? undefined;
    const code = codeEl?.props?.children ?? "";
    return <CodeBlock language={lang}>{code}</CodeBlock>;
  },

  // Blockquote → Callout note
  blockquote: ({ children }) => <Callout variant="note">{children}</Callout>,

  // Unordered list
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 pl-2" style={{ color: "#19213D" }}>
      {children}
    </ul>
  ),

  // Ordered list
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-2" style={{ color: "#19213D" }}>
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="leading-7">{children}</li>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-8 border-t" style={{ borderColor: "#d1d5db" }} />
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium underline underline-offset-2 transition-colors"
      style={{ color: "#149A9B" }}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Strong
  strong: ({ children }) => (
    <strong className="font-semibold" style={{ color: "#19213D" }}>
      {children}
    </strong>
  ),
};
