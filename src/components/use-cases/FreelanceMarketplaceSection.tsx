"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink } from "lucide-react";

const freelanceSteps = [
  {
    number: "01",
    title: "Client locks funds in escrow",
    description:
      "The client locks payment in escrow on Stellar. The money stays there until the work is done or both sides agree on an outcome.",
  },
  {
    number: "02",
    title: "Release when work is done",
    description:
      "When the freelancer delivers and the client approves, funds go straight to the freelancer. No platform holds the cash or triggers payouts by hand.",
  },
  {
    number: "03",
    title: "Disputes settled on-chain",
    description:
      "If there’s something goes wrong, dispute resolution runs on Stellar. Release, refund, or split: the outcome is recorded on-chain and no single party is the custodian.",
  },
];

const freelanceBenefits = [
  "Escrow is non-custodial. Neither party holds the other’s funds.",
  "Funds release automatically when the agreed conditions are met.",
  "Disputes are resolved on-chain with clear, enforceable outcomes.",
  "Runs on Stellar for fast, low-cost settlements worldwide.",
  "OFFER-HUB.org already uses it for live freelance marketplaces.",
];

export default function FreelanceMarketplaceSection() {
  return (
    <section id="freelance" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
            Use case
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-primary">
            Freelance Marketplace
          </h2>
          <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-text-secondary">
            OFFER-HUB runs freelance marketplaces like{" "}
            <a
              href="https://offer-hub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline text-primary"
            >
              OFFER-HUB.org
            </a>
            . Escrow, automatic release, and dispute resolution all happen on
            Stellar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12">
          {freelanceSteps.map((step, index) => (
            <motion.article
              key={step.number}
              className="rounded-2xl p-6 shadow-raised bg-background"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.12,
                duration: 0.45,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <p className="text-sm font-black tracking-wide mb-3 text-primary">
                {step.number}
              </p>
              <h3 className="text-lg font-bold leading-snug mb-2 text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="rounded-2xl p-6 md:p-8 shadow-raised bg-background"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary">
            Key benefits
          </h3>

          <ul className="space-y-4 mb-8">
            {freelanceBenefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.08 + 0.1,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-sm md:text-base font-light leading-relaxed text-text-secondary">
                  {benefit}
                </span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <a
              href="https://offer-hub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle transition-all duration-[400ms] ease-out bg-primary text-white"
            >
              <span>Visit OFFER-HUB.org</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
