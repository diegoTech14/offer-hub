"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section
      style={{ background: "linear-gradient(180deg, #F1F3F7 0%, #e8eef5 100%)" }}
      className="py-28"
    >
      <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-10">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-[0.4em]"
            style={{ color: "#149A9B" }}
          >
            Get started today
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{ color: "#19213D" }}
          >
            The payments layer your marketplace deserves
          </h2>
          <p className="text-lg font-light leading-relaxed" style={{ color: "#6D758F" }}>
            Self-hosted, non-custodial, open source. Own your infrastructure from day one.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <a
            href="/contact"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
            style={{ background: "#149A9B" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background = "#0d7377")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background = "#149A9B")
            }
          >
            Book a demo
          </a>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-[400ms] ease-out shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
            style={{ color: "#149A9B", background: "#F1F3F7", border: "1.5px solid #149A9B" }}
          >
            Start Free Trial
          </a>
        </motion.div>
      </div>
    </section>
  );
}
