"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

const openIssues = [
  {
    title: "Improve CI cache invalidation strategy",
    priority: "Medium",
    id: 1055,
  },
  {
    title: "Add e2e tests for payout cancellation",
    priority: "High",
    id: 1051,
  },
  { title: "Expose webhook replay in dashboard", priority: "Low", id: 1048 },
  { title: "Polish mobile nav focus styles", priority: "Low", id: 1046 },
];

const OpenIssuesSection = () => {
  return (
    <section id="open-issues" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open Issues"
          title="Help unblock active workstreams"
          subtitle="Active workstreams where your help makes a difference."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {openIssues.map((issue, index) => (
            <motion.article
              key={issue.id}
              className="rounded-2xl bg-background p-6 shadow-raised"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-text-primary">
                  {issue.title}
                </h3>
                <AlertCircle size={18} className="text-primary" />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Issue #{issue.id}</span>
                <span className="font-semibold text-text-primary">
                  {issue.priority}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpenIssuesSection;
