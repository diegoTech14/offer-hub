import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - OFFER-HUB",
  description: "Complete documentation for OFFER-HUB Orchestrator",
};

export default function DocsIntroduction() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Introduction to OFFER-HUB</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Welcome to the OFFER-HUB Orchestrator documentation. OFFER-HUB is a self-hosted,
        non-custodial payments orchestration platform designed for modern marketplaces.
      </p>

      <h2 style={{ color: "#19213D" }}>What is OFFER-HUB?</h2>

      <p style={{ color: "#6D758F" }}>
        OFFER-HUB empowers marketplace operators to provide secure escrow payments without
        building complex payment infrastructure. It's:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li><strong>Self-Hosted:</strong> Deploy on your own infrastructure with full control</li>
        <li><strong>Non-Custodial:</strong> Funds live in smart contracts, not in the orchestrator</li>
        <li><strong>Provider-Agnostic:</strong> Switch between crypto and fiat via configuration</li>
        <li><strong>Open Source:</strong> MIT licensed and fully transparent</li>
      </ul>

      <h2 style={{ color: "#19213D" }}>Key Features</h2>

      <div className="grid gap-6 my-8">
        <div
          className="p-6 rounded-xl shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <h3 style={{ color: "#149A9B", marginTop: 0 }}>🔒 Secure Escrow</h3>
          <p style={{ color: "#6D758F", marginBottom: 0 }}>
            Stellar-powered smart contracts handle all fund custody. Every transaction
            is cryptographically secured on-chain.
          </p>
        </div>

        <div
          className="p-6 rounded-xl shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <h3 style={{ color: "#149A9B", marginTop: 0 }}>⚡ Instant Settlements</h3>
          <p style={{ color: "#6D758F", marginBottom: 0 }}>
            Stellar's 3-5 second finality means your merchants get paid fast,
            not days later.
          </p>
        </div>

        <div
          className="p-6 rounded-xl shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <h3 style={{ color: "#149A9B", marginTop: 0 }}>🛠️ Developer-First API</h3>
          <p style={{ color: "#6D758F", marginBottom: 0 }}>
            REST endpoints, webhooks, and an SDK built for speed. Integrate in
            hours, not weeks.
          </p>
        </div>
      </div>

      <h2 style={{ color: "#19213D" }}>Getting Started</h2>

      <p style={{ color: "#6D758F" }}>
        Ready to integrate OFFER-HUB into your marketplace? Check out the{" "}
        <a href="/docs/quick-start" style={{ color: "#149A9B" }}>Quick Start Guide</a>
        {" "}to get up and running in minutes.
      </p>

      <div
        className="p-6 rounded-xl mt-8"
        style={{
          background: "rgba(20,154,155,0.06)",
          borderLeft: "4px solid #149A9B"
        }}
      >
        <p style={{ color: "#19213D", marginBottom: "0.5rem", fontWeight: 600 }}>
          💡 New to payment orchestration?
        </p>
        <p style={{ color: "#6D758F", marginBottom: 0 }}>
          Start with <a href="/docs/guide/core-concepts" style={{ color: "#149A9B" }}>
          Core Concepts</a> to understand how OFFER-HUB works under the hood.
        </p>
      </div>
    </article>
  );
}
