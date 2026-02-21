"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2 } from "lucide-react";

const servicePlatformSteps = [
  {
    number: "01",
    title: "Define scope and milestones",
    description:
      "Attach a statement of work (SOW), split delivery into clear milestones, and lock funding terms before work starts.",
  },
  {
    number: "02",
    title: "Fund escrow and execute",
    description:
      "Clients deposit funds into smart escrow while providers deliver each milestone with transparent status updates.",
  },
  {
    number: "03",
    title: "Release or resolve",
    description:
      "Approved milestones release instantly, while contested work enters structured dispute resolution with auditable outcomes.",
  },
];

const servicePlatformBenefits = [
  "SOW-based releases that align payments with agreed deliverables.",
  "Built-in support for multi-milestone projects and partial payouts.",
  "On-chain dispute resolution flows with release, refund, or split decisions.",
  "Reduced payment risk for providers and stronger trust for clients.",
  "Operational flexibility across legal, consulting, design, and other service marketplaces.",
];

export default function UseCasesPage() {
  return (
    <>
      <Navbar />

      <main className="py-20 md:py-24">
        <section id="service-platforms" className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              className="max-w-3xl mb-14"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <p
                className="text-xs font-medium uppercase tracking-[0.4em] mb-4"
                style={{ color: "#149A9B" }}
              >
                Use Case
              </p>
              <h1
                className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
                style={{ color: "#19213D" }}
              >
                Service Platforms
              </h1>
              <p className="mt-5 text-base md:text-lg font-light leading-relaxed" style={{ color: "#6D758F" }}>
                Professional service marketplaces can use OFFER-HUB to protect both clients and providers with smart
                escrow contracts that enforce scope, milestones, and outcomes without manual settlement risk.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-10">
              <motion.div
                className="xl:col-span-3 rounded-2xl p-6 md:p-8 shadow-raised"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 80% at 10% 0%, rgba(20,154,155,0.10) 0%, rgba(20,154,155,0.03) 45%, transparent 70%), #F1F3F7",
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: "#19213D" }}>
                  How it works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                  {servicePlatformSteps.map((step, index) => (
                    <motion.article
                      key={step.number}
                      className="rounded-xl p-5 shadow-raised-sm"
                      style={{ background: "#F1F3F7" }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
                      viewport={{ once: true, margin: "-80px" }}
                    >
                      <p className="text-sm font-black tracking-wide mb-3" style={{ color: "#149A9B" }}>
                        {step.number}
                      </p>
                      <h3 className="text-lg font-bold leading-snug mb-2" style={{ color: "#19213D" }}>
                        {step.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed" style={{ color: "#6D758F" }}>
                        {step.description}
                      </p>
                    </motion.article>
                  ))}
                </div>
              </motion.div>

              <motion.aside
                className="xl:col-span-2 rounded-2xl p-6 md:p-8 shadow-raised"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 80% at 95% 10%, rgba(13,115,119,0.11) 0%, rgba(13,115,119,0.03) 48%, transparent 72%), #F1F3F7",
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: "#19213D" }}>
                  Key benefits
                </h2>

                <ul className="space-y-4">
                  {servicePlatformBenefits.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 + 0.1, duration: 0.4, ease: "easeOut" }}
                      viewport={{ once: true, margin: "-80px" }}
                    >
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#149A9B" }} />
                      <span className="text-sm md:text-base font-light leading-relaxed" style={{ color: "#6D758F" }}>
                        {benefit}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
