"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

const contributors = [
  { name: "Ada M.", area: "Core Protocol", commits: 248 },
  { name: "Dami O.", area: "Frontend", commits: 133 },
  { name: "Hassan K.", area: "DevRel", commits: 92 },
  { name: "Lina S.", area: "Tooling", commits: 87 },
  { name: "Marta P.", area: "QA", commits: 76 },
  { name: "Tomi A.", area: "Docs", commits: 70 },
];

const ContributorsSection = () => {
  return (
    <section id="contributors" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contributors"
          title="Meet the people shipping OFFER-HUB"
          subtitle="Placeholder grid for issue #1027. Swap mock profiles for live contributor data and GitHub avatars."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contributors.map((person, index) => (
            <motion.article
              key={person.name}
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
              <Users size={18} className="text-primary" />
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                {person.name}
              </h3>
              <p className="mt-1 text-sm font-light text-text-secondary">
                {person.area}
              </p>
              <p className="mt-4 text-sm font-medium text-text-primary">
                {person.commits} commits
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContributorsSection;
