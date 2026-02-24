"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

interface IssueData {
  number: number;
  title: string;
  priority: string;
  url: string;
  labels: string[];
}

interface OpenIssuesSectionProps {
  issues: IssueData[];
}

const OpenIssuesSection = ({ issues }: OpenIssuesSectionProps) => {
  return (
    <section id="open-issues" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open Issues"
          title="Help unblock active workstreams"
          subtitle="Active workstreams where your help makes a difference."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {issues.map((issue, index) => (
            <motion.article
              key={issue.number}
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
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-text-primary hover:text-primary"
                >
                  {issue.title}
                </a>
                <AlertCircle size={18} className="text-primary flex-shrink-0" />
              </div>
              {issue.labels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {issue.labels.slice(0, 3).map((label) => (
                    <span
                      key={label}
                      className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Issue #{issue.number}</span>
                <span className={`font-semibold ${
                  issue.priority === 'High' ? 'text-red-600' :
                  issue.priority === 'Low' ? 'text-green-600' :
                  'text-text-primary'
                }`}>
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
