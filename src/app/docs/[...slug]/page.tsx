import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllDocSlugs, getDocBySlug, extractHeadings } from "@/lib/mdx";
import { MDX_COMPONENTS } from "@/components/docs/mdx-components";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { DocPageActions } from "@/components/docs/DocPageActions";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));
  if (!doc) return {};

  return {
    title: `${doc.frontmatter.title} — OFFER-HUB Docs`,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));

  if (!doc) notFound();

  const headings = extractHeadings(doc.content);

  return (
    <div className="flex gap-10">
      {/* ── Article ── */}
      <article className="flex-1 min-w-0">
        {/* Page header */}
        <div className="mb-8 pb-6 border-b" style={{ borderColor: "#d1d5db" }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#19213D" }}>
                {doc.frontmatter.title}
              </h1>
              {doc.frontmatter.description && (
                <p className="text-base leading-relaxed" style={{ color: "#6D758F" }}>
                  {doc.frontmatter.description}
                </p>
              )}
            </div>

            <DocPageActions
              slug={doc.slug}
              title={doc.frontmatter.title}
              description={doc.frontmatter.description}
              markdownContent={doc.content}
              frontmatter={doc.frontmatter}
            />
          </div>
        </div>

        {/* MDX content */}
        <div className="max-w-none" id="doc-page-export-content">
          <MDXRemote source={doc.content} components={MDX_COMPONENTS} />
        </div>
      </article>

      {/* ── Table of Contents ── */}
      {headings.length > 0 && (
        <aside className="hidden xl:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}
    </div>
  );
}
