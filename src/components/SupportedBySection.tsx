"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const partners = [
  {
    name: "Stellar",
    logo: "/stellar.png",
    url: "https://stellar.org",
    width: 60,
    height: 15,
  },
  {
    name: "Trustless Work",
    logo: "/trustless-works.webp",
    url: "https://www.trustlesswork.com/",
    width: 70,
    height: 15,
  },
];

export default function SupportedBySection() {
  return (
    <section className="py-8 bg-transparent">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Small Label */}
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6D758F]/60">
            Supported by
          </p>

          {/* Partner Logos - Inline */}
          <div className="flex items-center gap-6">
            {partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={partner.width}
                  height={partner.height}
                  className="object-contain"
                  priority
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
