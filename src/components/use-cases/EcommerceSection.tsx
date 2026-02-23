"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const ecommerceSteps = [
  {
    number: "01",
    title: "Buyer pays into escrow",
    description:
      "The buyer pays into escrow on Stellar. The seller sees the funds are there and can safely ship the order.",
  },
  {
    number: "02",
    title: "Release on delivery",
    description:
      "When delivery is confirmed by tracking, signature, or a simple click from the buyer, funds are released to the seller automatically.",
  },
  {
    number: "03",
    title: "If something goes wrong",
    description:
      "If the order is missing or not as described, the buyer can open a dispute. The case is handled on-chain with a clear result: release, refund, or split.",
  },
];

const ecommerceBenefits = [
  "Buyers pay once and funds stay in escrow until the order is delivered.",
  "Funds release automatically when you mark the order as delivered.",
  "Sellers get paid quickly instead of waiting on payout batches.",
  "Disputes are handled on-chain with a visible outcome everyone can see.",
  "Plugs into existing stores by pointing it at your Stellar account.",
];

export default function EcommerceSection() {
  return (
    <section id="ecommerce" className="py-16 md:py-20 bg-white">
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
            eCommerce
          </h2>
          <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-text-secondary">
            OFFER-HUB adds buyer and seller protection to your store. The buyer pays into escrow,
            and the seller gets paid after the order is delivered.
          </p>
        </motion.div>

        {/* How it works — 3 step cards at top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12">
          {ecommerceSteps.map((step, index) => (
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

        {/* Key benefits */}
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

          <ul className="space-y-4">
            {ecommerceBenefits.map((benefit, index) => (
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
        </motion.div>
      </div>
    </section>
  );
}
