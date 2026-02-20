import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Installation - OFFER-HUB Documentation",
  description: "Complete installation guide for OFFER-HUB",
};

export default function InstallationPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Installation</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Complete installation guide for deploying OFFER-HUB in production.
      </p>

      <h2 style={{ color: "#19213D" }}>Prerequisites</h2>

      <ul style={{ color: "#6D758F" }}>
        <li><strong>Node.js:</strong> v20 LTS or higher</li>
        <li><strong>PostgreSQL:</strong> v14 or higher</li>
        <li><strong>Redis:</strong> v6 or higher (for queues and caching)</li>
        <li><strong>Stellar Account:</strong> Testnet or Mainnet account with USDC</li>
      </ul>

      <h2 style={{ color: "#19213D" }}>System Requirements</h2>

      <div
        className="p-6 rounded-xl"
        style={{ background: "#F1F3F7" }}
      >
        <h3 style={{ color: "#149A9B", marginTop: 0 }}>Minimum Specs</h3>
        <ul style={{ color: "#6D758F", marginBottom: 0 }}>
          <li>2 CPU cores</li>
          <li>4 GB RAM</li>
          <li>20 GB SSD storage</li>
        </ul>
      </div>

      <h2 style={{ color: "#19213D" }}>Database Setup</h2>

      <p style={{ color: "#6D758F" }}>
        Create a PostgreSQL database for OFFER-HUB:
      </p>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>createdb offerhub_production</code>
      </pre>

      <h2 style={{ color: "#19213D" }}>Next Steps</h2>

      <p style={{ color: "#6D758F" }}>
        Continue to <a href="/docs/configuration" style={{ color: "#149A9B" }}>
        Configuration</a> to set up your environment variables and API keys.
      </p>
    </article>
  );
}
