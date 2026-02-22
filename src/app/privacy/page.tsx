"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

import {
  Mail,
  Cookie,
  ShieldCheck,
  Link2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Data Collection Policy",
    description:
      "We collect information you voluntarily provide when creating an account, setting up your marketplace, or contacting support — including your name, email address, business details, and payment information. We also automatically collect technical data such as IP addresses, browser type, device identifiers, and interaction logs to ensure the stability, security, and performance of Offer Hub.",
    large: false,
    gradient:
      "radial-gradient(ellipse 85% 80% at 92% 88%, rgba(10,98,101,0.15) 0%, rgba(10,98,101,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#149A9B",
  },
  {
    icon: Cookie,
    title: "Cookies",
    description:
      "We use essential cookies to keep you logged in and maintain your session. With your consent, we may use analytics cookies to understand how users navigate the platform. These are never used for advertising. You can manage your preferences at any time via your browser settings or our cookie preference center.",
    large: false,
    gradient:
      "radial-gradient(ellipse 85% 80% at 12% 80%, rgba(20,154,155,0.13) 0%, rgba(21,148,156,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#149A9B",
  },
  {
    icon: Link2,
    title: "Third-Party Services",
    description:
      "Offer Hub integrates with carefully selected third-party services. Payment processing is handled by PCI-compliant providers — we never store raw card data. Infrastructure providers may process your data under strict agreements aligned with GDPR. We do not sell your data to third parties, nor share it with advertisers.",
    large: false,
    gradient:
      "radial-gradient(ellipse 80% 85% at 85% 50%, rgba(21,148,156,0.15) 0%, rgba(20,154,155,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#149A9B",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">

        {/* Heading */}
        <motion.div
          className="text-center mb-10 sm:mb-14 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
            Privacy Policy
          </p>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-text-primary"
          >
            Your privacy, our commitment.
          </h1>
          <p
            className="mt-4 text-base sm:text-lg font-light max-w-xl mx-auto px-2 text-secondary"
          >
            We believe in full transparency about how we handle your data.{" "}
            <span className="text-primary">Last updated: February 21, 2026.</span>
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10 mb-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`${
                  feature.large ? "sm:col-span-2 md:col-span-2" : ""
                } p-6 sm:p-7 md:p-8 rounded-2xl shadow-raised flex flex-col gap-4`}
                style={{ background: feature.gradient }}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <div
                  className="w-10 h-10 rounded-xl shadow-raised-sm flex items-center justify-center shrink-0 bg-background"
                >
                  <Icon size={18} style={{ color: feature.iconColor }} />
                </div>
                <h3
                  className={`font-bold ${feature.large ? "text-2xl" : "text-lg"} text-primary`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`font-light leading-relaxed ${feature.large ? "text-base" : "text-sm"} text-text-secondary`}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Contact card */}
        <motion.div
          className="p-6 sm:p-8 md:p-10 rounded-2xl shadow-raised flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-10 mt-5"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(20,154,155,0.25) 0%, rgba(20,154,155,0.08) 50%, transparent 75%), #19213D",
          }}
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Left: copy */}
          <div className="flex flex-col gap-4 md:max-w-lg">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(241,243,247,0.08)",
                boxShadow:
                  "3px 3px 6px rgba(0,0,0,0.3), -3px -3px 6px rgba(255,255,255,0.05)",
              }}
            >
              <Mail size={18} className="text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Get in Touch</h2>
            <p
              className="font-light leading-relaxed text-sm text-text-secondary"
            >
              Questions about this policy or how we handle your data? Our privacy
              team is here to help. We aim to respond to all inquiries within 2
              business days.
            </p>
          </div>

          {/* Right: contacts */}
          <div className="flex flex-col gap-3 w-full md:w-auto md:shrink-0 md:min-w-[240px]">
            {[
              { label: "Privacy inquiries", email: "privacy@offerhub.io" },
              { label: "General support", email: "support@offerhub.io" },
            ].map(({ label, email }) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex flex-col gap-0.5 rounded-xl px-5 py-4 transition-all duration-200"
                style={{
                  background: "rgba(241,243,247,0.06)",
                  boxShadow:
                    "3px 3px 6px rgba(0,0,0,0.25), -3px -3px 6px rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow =
                    "1px 1px 3px rgba(0,0,0,0.25), -1px -1px 3px rgba(255,255,255,0.04)";
                  el.style.background = "rgba(241,243,247,0.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow =
                    "3px 3px 6px rgba(0,0,0,0.25), -3px -3px 6px rgba(255,255,255,0.04)";
                  el.style.background = "rgba(241,243,247,0.06)";
                }}
              >
                <span className="text-xs font-medium text-text-secondary">
                  {label}
                </span>
                <span className="text-sm font-medium text-primary">
                  {email}
                </span>
              </a>
            ))}

            <div
              className="rounded-xl px-5 py-4"
              style={{
                background: "rgba(241,243,247,0.04)",
                boxShadow:
                  "inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.03)",
              }}
            >
              <p className="text-xs leading-relaxed text-text-secondary">
                Offer Hub Inc.
                <br />
                123 Market Street, Suite 400
                <br />
                San Francisco, CA 94105, USA
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}