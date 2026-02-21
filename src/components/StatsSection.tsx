"use client";

import { motion, type Variants } from "framer-motion";

const stats = [
  { value: "10K+", label: "Active Merchants" },
  { value: "$50M+", label: "Volume Processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50+", label: "Countries" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col items-center text-center p-8 rounded-2xl shadow-raised"
              style={{ background: "#F1F3F7" }}
            >
              <span
                className="text-5xl font-black tracking-tight"
                style={{ color: "#149A9B" }}
              >
                {stat.value}
              </span>
              <span
                className="text-sm font-medium mt-3 uppercase tracking-widest"
                style={{ color: "#6D758F" }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
