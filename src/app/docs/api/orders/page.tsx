import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders API - OFFER-HUB API Reference",
  description: "Complete API reference for OFFER-HUB Orders endpoints",
};

export default function OrdersAPIPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 style={{ color: "#19213D" }}>Orders API</h1>

      <p style={{ color: "#6D758F", fontSize: "1.125rem" }}>
        Complete API reference for creating and managing orders.
      </p>

      <h2 style={{ color: "#19213D" }}>Create Order</h2>

      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ background: "#F1F3F7" }}
      >
        <span
          className="px-3 py-1 rounded-md text-xs font-semibold"
          style={{ background: "#16a34a", color: "#ffffff" }}
        >
          POST
        </span>
        <code style={{ color: "#19213D" }}>/api/orders</code>
      </div>

      <p style={{ color: "#6D758F", marginTop: "1.5rem" }}>
        Creates a new order in the system.
      </p>

      <h3 style={{ color: "#19213D" }}>Request Body</h3>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>{`{
  "buyerId": "usr_abc123",      // Required
  "sellerId": "usr_def456",     // Required
  "amount": 1000,               // Required (in cents)
  "currency": "USDC",           // Required
  "description": "string",      // Optional
  "clientOrderRef": "string"    // Optional
}`}</code>
      </pre>

      <h3 style={{ color: "#19213D" }}>Response</h3>

      <pre
        className="rounded-lg p-4"
        style={{ background: "#19213D", color: "#F1F3F7" }}
      >
        <code>{`{
  "ok": true,
  "code": 1000,
  "type": "success",
  "message": "Order created successfully",
  "data": {
    "id": "ord_xyz789",
    "status": "CREATED",
    "buyerId": "usr_abc123",
    "sellerId": "usr_def456",
    "amount": 1000,
    "currency": "USDC",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`}</code>
      </pre>

      <hr style={{ borderColor: "#d1d5db", margin: "2rem 0" }} />

      <h2 style={{ color: "#19213D" }}>Get Order</h2>

      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ background: "#F1F3F7" }}
      >
        <span
          className="px-3 py-1 rounded-md text-xs font-semibold"
          style={{ background: "#149A9B", color: "#ffffff" }}
        >
          GET
        </span>
        <code style={{ color: "#19213D" }}>/api/orders/:id</code>
      </div>

      <p style={{ color: "#6D758F", marginTop: "1.5rem" }}>
        Retrieves details for a specific order.
      </p>

      <hr style={{ borderColor: "#d1d5db", margin: "2rem 0" }} />

      <h2 style={{ color: "#19213D" }}>Reserve Funds</h2>

      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ background: "#F1F3F7" }}
      >
        <span
          className="px-3 py-1 rounded-md text-xs font-semibold"
          style={{ background: "#16a34a", color: "#ffffff" }}
        >
          POST
        </span>
        <code style={{ color: "#19213D" }}>/api/orders/:id/reserve</code>
      </div>

      <p style={{ color: "#6D758F", marginTop: "1.5rem" }}>
        Reserves funds from the buyer's balance for this order.
      </p>

      <div
        className="p-6 rounded-xl mt-8"
        style={{
          background: "rgba(20,154,155,0.06)",
          borderLeft: "4px solid #149A9B"
        }}
      >
        <p style={{ color: "#19213D", marginBottom: "0.5rem", fontWeight: 600 }}>
          💡 Idempotency
        </p>
        <p style={{ color: "#6D758F", marginBottom: 0 }}>
          All mutation endpoints support idempotency via the{" "}
          <code>Idempotency-Key</code> header to prevent duplicate operations.
        </p>
      </div>
    </article>
  );
}
