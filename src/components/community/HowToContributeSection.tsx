"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

const contributionSteps = [
  "Read the contribution guide and code of conduct.",
  "Pick an issue tagged good-first-issue or help-wanted.",
  "Discuss approach quickly in an issue or discussion thread.",
  "Open your PR with tests, screenshots, and clear scope.",
];

const HowToContributeSection = () => {
  return (
    <section id="how-to-contribute" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="How to Contribute"
          title="A quick path from first issue to first merge"
          subtitle="Everything you need to go from first issue to first merge."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {contributionSteps.map((step, index) => (
            <motion.article
              key={step}
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
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-1 text-primary" />
                <p className="text-base font-light leading-relaxed text-text-primary">
                  {step}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToContributeSection;
