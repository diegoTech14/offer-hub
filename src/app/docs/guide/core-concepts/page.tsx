import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Core Concepts - OFFER-HUB Documentation",
  description: "Understand the core concepts behind OFFER-HUB",
};

export default function CoreConceptsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Core Concepts</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Learn the fundamental concepts that power OFFER-HUB's payment orchestration.
      </p>

      <h2 style={{ color: "#19213D" }}>Non-Custodial Architecture</h2>

      <p style={{ color: "#6D758F" }}>
        OFFER-HUB never holds your funds. All escrow operations happen on-chain via
        smart contracts on the Stellar network. This means:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li>No regulatory burden of holding custodial funds</li>
        <li>Cryptographically secured transactions</li>
        <li>Full transparency via blockchain explorer</li>
        <li>No single point of failure</li>
      </ul>

      <h2 style={{ color: "#19213D" }}>Order Lifecycle</h2>

      <div className="space-y-4 my-8">
        <div
          className="p-4 rounded-lg shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#149A9B", color: "#ffffff" }}
            >
              1
            </div>
            <div>
              <h3 style={{ color: "#19213D", marginTop: 0, marginBottom: "0.25rem" }}>
                Order Created
              </h3>
              <p style={{ color: "#6D758F", fontSize: "0.875rem", marginBottom: 0 }}>
                Buyer and seller agree on terms, amount, and deliverables
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#149A9B", color: "#ffffff" }}
            >
              2
            </div>
            <div>
              <h3 style={{ color: "#19213D", marginTop: 0, marginBottom: "0.25rem" }}>
                Funds Reserved
              </h3>
              <p style={{ color: "#6D758F", fontSize: "0.875rem", marginBottom: 0 }}>
                Buyer's balance is reserved for this order
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#149A9B", color: "#ffffff" }}
            >
              3
            </div>
            <div>
              <h3 style={{ color: "#19213D", marginTop: 0, marginBottom: "0.25rem" }}>
                Escrow Created & Funded
              </h3>
              <p style={{ color: "#6D758F", fontSize: "0.875rem", marginBottom: 0 }}>
                Smart contract deployed on Stellar and funded with USDC
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#149A9B", color: "#ffffff" }}
            >
              4
            </div>
            <div>
              <h3 style={{ color: "#19213D", marginTop: 0, marginBottom: "0.25rem" }}>
                Work Completed
              </h3>
              <p style={{ color: "#6D758F", fontSize: "0.875rem", marginBottom: 0 }}>
                Seller delivers work, buyer reviews
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-lg shadow-raised-sm"
          style={{ background: "#F1F3F7" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#16a34a", color: "#ffffff" }}
            >
              5
            </div>
            <div>
              <h3 style={{ color: "#19213D", marginTop: 0, marginBottom: "0.25rem" }}>
                Funds Released
              </h3>
              <p style={{ color: "#6D758F", fontSize: "0.875rem", marginBottom: 0 }}>
                Smart contract releases USDC to seller's wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ color: "#19213D" }}>Learn More</h2>

      <p style={{ color: "#6D758F" }}>
        Dive deeper into specific topics:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li>
          <a href="/docs/guide/orders" style={{ color: "#149A9B" }}>Orders Management</a>
        </li>
        <li>
          <a href="/docs/guide/escrow" style={{ color: "#149A9B" }}>Escrow Operations</a>
        </li>
        <li>
          <a href="/docs/api/orders" style={{ color: "#149A9B" }}>Orders API Reference</a>
        </li>
      </ul>
    </article>
  );
}
