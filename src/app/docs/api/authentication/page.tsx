import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - OFFER-HUB API Reference",
  description: "API authentication guide for OFFER-HUB",
};

export default function AuthenticationPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Authentication</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        All API requests to OFFER-HUB require authentication via API keys.
      </p>

      <h2 style={{ color: "#19213D" }}>API Keys</h2>

      <p style={{ color: "#6D758F" }}>
        Generate API keys from your dashboard. Each key has specific scopes:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li><strong>read:</strong> Read-only access to resources</li>
        <li><strong>write:</strong> Create and modify resources</li>
        <li><strong>support:</strong> Access to dispute resolution endpoints</li>
      </ul>

      <h2 style={{ color: "#19213D" }}>Using API Keys</h2>

      <p style={{ color: "#6D758F" }}>
        Include your API key in the <code>Authorization</code> header:
      </p>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>{`curl https://api.offerhub.io/orders \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE"`}</code>
      </pre>

      <div
        className="p-6 rounded-xl mt-8"
        style={{
          background: "rgba(217,119,6,0.08)",
          borderLeft: "4px solid #d97706"
        }}
      >
        <p style={{ color: "#19213D", marginBottom: "0.5rem", fontWeight: 600 }}>
          ⚠️ Security Best Practices
        </p>
        <ul style={{ color: "#6D758F", marginBottom: 0 }}>
          <li>Never commit API keys to version control</li>
          <li>Use environment variables to store keys</li>
          <li>Rotate keys regularly</li>
          <li>Use separate keys for development and production</li>
        </ul>
      </div>

      <h2 style={{ color: "#19213D" }}>Rate Limits</h2>

      <p style={{ color: "#6D758F" }}>
        API requests are rate-limited to:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li><strong>100 requests/minute</strong> for read operations</li>
        <li><strong>20 requests/minute</strong> for write operations</li>
      </ul>
    </article>
  );
}
