"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

const changelogEntries = [
  {
    version: "v0.3.0",
    date: "March 2024",
    title: "New UI Components",
    badge: "Feature",
    badgeColor: "bg-primary text-white",
    description:
      "Introduced a new set of neumorphic UI components, improved accessibility, and updated the brand palette for better consistency.",
    changes: [
      "Added Neumorphic Card component",
      "Enhanced mobile navigation",
      "New icon set integration",
    ],
  },
  {
    version: "v0.2.0",
    date: "February 2024",
    title: "Performance Updates",
    badge: "Fix",
    badgeColor: "bg-warning text-white",
    description:
      "Optimized bundle size and improved page load times by implementing better code splitting and image optimization strategies.",
    changes: [
      "Reduced main bundle size by 15%",
      "Improved LCP scores",
      "Fixed memory leaks in dashboard charts",
    ],
  },
  {
    version: "v0.1.0",
    date: "January 2024",
    title: "Initial Launch",
    badge: "Breaking",
    badgeColor: "bg-error text-white",
    description:
      "The first official release of Offer Hub, featuring secure escrow payments and marketplace integration tools.",
    changes: [
      "Core escrow protocol implementation",
      "Marketplace API v1 release",
      "Initial landing page and docs",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6">

      </main>

      <Footer />
    </div>
  );
}
