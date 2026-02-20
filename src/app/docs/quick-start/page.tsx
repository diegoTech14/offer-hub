import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Start - OFFER-HUB Documentation",
  description: "Get started with OFFER-HUB in minutes",
};

export default function QuickStartPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Quick Start</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Get OFFER-HUB up and running in your marketplace in less than 10 minutes.
      </p>

      <h2 style={{ color: "#19213D" }}>Step 1: Clone the Repository</h2>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>git clone https://github.com/your-org/offer-hub.git</code>
        {"\n"}
        <code>cd offer-hub</code>
      </pre>

      <h2 style={{ color: "#19213D" }}>Step 2: Install Dependencies</h2>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>npm install</code>
      </pre>

      <h2 style={{ color: "#19213D" }}>Step 3: Configure Environment</h2>

      <p style={{ color: "#6D758F" }}>
        Copy the example environment file and update with your credentials:
      </p>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>cp .env.example .env</code>
      </pre>

      <h2 style={{ color: "#19213D" }}>Step 4: Start the Server</h2>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>npm run dev</code>
      </pre>

      <div
        className="p-6 rounded-xl mt-8"
        style={{
          background: "rgba(22,163,74,0.08)",
          borderLeft: "4px solid #16a34a"
        }}
      >
        <p style={{ color: "#19213D", marginBottom: "0.5rem", fontWeight: 600 }}>
          ✅ You're all set!
        </p>
        <p style={{ color: "#6D758F", marginBottom: 0 }}>
          The orchestrator is now running at <code>http://localhost:4000</code>.
          Check out the <a href="/docs/guide/orders" style={{ color: "#149A9B" }}>
          Orders Guide</a> to create your first escrow transaction.
        </p>
      </div>
    </article>
  );
}
