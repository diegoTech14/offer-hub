"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const realEstateSteps = [
  {
    number: "01",
    title: "Lock rental deposit",
    description:
      "Tenants deposit funds into non-custodial escrow at lease signing. Funds remain locked until contract conditions are met.",
  },
  {
    number: "02",
    title: "Condition-based release",
    description:
      "Smart contracts automatically verify lease terms, property condition reports, and agreed milestones before releasing funds.",
  },
  {
    number: "03",
    title: "Resolve disputes fairly",
    description:
      "Contested deposits enter structured dispute resolution with transparent evidence review and auditable outcomes.",
  },
];

const realEstateBenefits = [
  "Non-custodial escrow protects both landlords and tenants without intermediaries.",
  "Automated release based on verified contract conditions and property inspections.",
  "Built-in dispute handling with transparent resolution flows.",
  "Cross-border rental payments with instant settlement on Stellar.",
  "Reduced friction for security deposits, earnest money, and rental agreements.",
];

export default function RealEstateSection() {
  return (
    <section id="real-estate" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
            Use Case
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-primary">
            Real Estate
          </h2>
          <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-text-secondary">
            OFFER-HUB enables secure rental deposits and real estate transactions by holding funds in non-custodial
            escrow and releasing them based on verified contract conditions, property inspections, and lease terms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-10">
          <motion.div
            className="xl:col-span-3 rounded-2xl p-6 md:p-8 shadow-raised bg-background"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-text-primary">
              How it works
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {realEstateSteps.map((step, index) => (
                <motion.article
                  key={step.number}
                  className="rounded-xl p-5 shadow-raised-sm bg-background"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-80px" }}
                >
                  <p className="text-sm font-black tracking-wide mb-3 text-primary">{step.number}</p>
                  <h4 className="text-lg font-bold leading-snug mb-2 text-text-primary">
                    {step.title}
                  </h4>
                  <p className="text-sm font-light leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <motion.aside
            className="xl:col-span-2 rounded-2xl p-6 md:p-8 shadow-raised bg-background"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary">
              Key benefits
            </h3>

            <ul className="space-y-4">
              {realEstateBenefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 + 0.1, duration: 0.4, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-80px" }}
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm md:text-base font-light leading-relaxed text-text-secondary">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
