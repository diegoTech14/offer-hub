import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders Guide - OFFER-HUB Documentation",
  description: "Learn how to manage orders in OFFER-HUB",
};

export default function OrdersGuidePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Orders</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Orders are the foundation of OFFER-HUB's escrow system. Learn how to create,
        manage, and track orders through their lifecycle.
      </p>

      <h2 style={{ color: "#19213D" }}>Creating an Order</h2>

      <p style={{ color: "#6D758F" }}>
        To create a new order, send a POST request to the orders endpoint:
      </p>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>{`POST /api/orders
Content-Type: application/json

{
  "buyerId": "usr_abc123",
  "sellerId": "usr_def456",
  "amount": 1000,
  "currency": "USDC",
  "description": "Website design project",
  "clientOrderRef": "order-2024-001"
}`}</code>
      </pre>

      <h2 style={{ color: "#19213D" }}>Order States</h2>

      <p style={{ color: "#6D758F" }}>
        Orders progress through several states:
      </p>

      <ul style={{ color: "#6D758F" }}>
        <li><code>CREATED</code> - Order initialized</li>
        <li><code>RESERVED</code> - Funds reserved from buyer's balance</li>
        <li><code>ESCROW_CREATED</code> - Smart contract deployed</li>
        <li><code>ESCROW_FUNDED</code> - Funds transferred to contract</li>
        <li><code>IN_PROGRESS</code> - Work is being performed</li>
        <li><code>COMPLETED</code> - Funds released to seller</li>
        <li><code>REFUNDED</code> - Funds returned to buyer</li>
        <li><code>DISPUTED</code> - Dispute opened, pending resolution</li>
      </ul>

      <div
        className="p-6 rounded-xl mt-8"
        style={{
          background: "rgba(20,154,155,0.06)",
          borderLeft: "4px solid #149A9B"
        }}
      >
        <p style={{ color: "#19213D", marginBottom: "0.5rem", fontWeight: 600 }}>
          📚 API Reference
        </p>
        <p style={{ color: "#6D758F", marginBottom: 0 }}>
          See the complete <a href="/docs/api/orders" style={{ color: "#149A9B" }}>
          Orders API documentation</a> for all available endpoints and parameters.
        </p>
      </div>
    </article>
  );
}
