"use client";

import { motion } from "framer-motion";
import { GitPullRequest } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

const recentPrs = [
  {
    title: "feat: add account-level escrow analytics",
    number: 1042,
    status: "Merged",
  },
  {
    title: "refactor: simplify wallet sync flow",
    number: 1039,
    status: "Reviewing",
  },
  {
    title: "fix: resolve pagination edge case in jobs feed",
    number: 1036,
    status: "Merged",
  },
  {
    title: "docs: add validator onboarding guide",
    number: 1033,
    status: "Draft",
  },
];

const RecentPRsSection = () => {
  return (
    <section id="recent-prs" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Recent Pull Requests"
          title="Latest community contributions"
          subtitle="The latest contributions from our open source community."
        />

        <div className="space-y-4">
          {recentPrs.map((pr, index) => (
            <motion.article
              key={pr.number}
              className="flex flex-col gap-4 rounded-2xl bg-background p-6 shadow-raised sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-3">
                <GitPullRequest size={18} className="mt-1 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-text-primary md:text-lg">
                    {pr.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    #{pr.number}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {pr.status}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentPRsSection;
