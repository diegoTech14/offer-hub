import { getSidebarNav } from "@/lib/mdx";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = getSidebarNav();

  return (
    <div className="min-h-screen" style={{ background: "#F1F3F7" }}>
      {/* Top padding for fixed navbar */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex gap-8 min-h-[calc(100vh-4rem)]">

            {/* ── Sidebar ── */}
            <aside
              className="hidden lg:block w-64 flex-shrink-0 py-10"
            >
              <div className="sticky top-24">
                <div
                  className="rounded-2xl shadow-raised p-5"
                  style={{ background: "#F1F3F7" }}
                >
                  <DocsSidebar nav={nav} />
                </div>
              </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0 py-10">
              {children}
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}
