import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { Navbar } from "@/components/layout/Navbar";

// Navigation structure for docs
const navItems = [
  {
    label: "Getting Started",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Quick Start", href: "/docs/quick-start" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Configuration", href: "/docs/configuration" },
    ],
  },
  {
    label: "Guide",
    links: [
      { label: "Core Concepts", href: "/docs/guide/core-concepts" },
      { label: "Orders", href: "/docs/guide/orders" },
      { label: "Escrow", href: "/docs/guide/escrow" },
      { label: "Wallets", href: "/docs/guide/wallets" },
      { label: "Disputes", href: "/docs/guide/disputes" },
      { label: "Webhooks", href: "/docs/guide/webhooks" },
    ],
  },
  {
    label: "API Reference",
    links: [
      { label: "Authentication", href: "/docs/api/authentication" },
      { label: "Orders API", href: "/docs/api/orders" },
      { label: "Escrow API", href: "/docs/api/escrow" },
      { label: "Balance API", href: "/docs/api/balance" },
      { label: "Events", href: "/docs/api/events" },
      { label: "Error Codes", href: "/docs/api/errors" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#F1F3F7" }}>
      <Navbar />

      {/* Docs Container */}
      <div className="pt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
          <div className="flex gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
              <DocsSidebar navItems={navItems} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div
                className="rounded-2xl shadow-raised p-8 lg:p-12"
                style={{ background: "#ffffff" }}
              >
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
