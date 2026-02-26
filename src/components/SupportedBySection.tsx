"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const partners = [
  {
    name: "Stellar",
    logo: "/stellar.png",
    url: "https://stellar.org",
    width: 160,
    height: 40,
  },
  {
    name: "Trustless Work",
    logo: "/trustless-works.webp",
    url: "https://www.trustlesswork.com/",
    width: 180,
    height: 40,
  },
];

export default function SupportedBySection() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#149A9B] mb-4">
            Our Partners
          </p>
          <h2 className="text-4xl font-black text-[#19213D] tracking-tighter sm:text-5xl leading-none">
            Supported by
          </h2>
        </motion.div>

        {/* Partner Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-12 md:gap-16"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Link
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-8 rounded-3xl bg-[#F1F3F7] shadow-raised hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative grayscale hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    width={partner.width}
                    height={partner.height}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-[#6D758F] text-sm font-medium">
            Interested in partnering with us?{" "}
            <Link
              href="/community#waitlist-form"
              className="text-[#149A9B] font-bold hover:underline"
            >
              Get in touch
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
