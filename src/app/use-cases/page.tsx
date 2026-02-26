"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
    Users,
    ShoppingBag,
    Gavel,
    Layers,
    Home,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/cn";

const USE_CASES = [
    { id: "freelance", label: "Freelance", title: "Freelance Marketplace", icon: Users, issue: "1021" },
    { id: "ecommerce", label: "eCommerce", title: "Global eCommerce", icon: ShoppingBag, issue: "1022" },
    { id: "dao-payroll", label: "DAO Payroll", title: "DAO & Web3 Payroll", icon: Gavel, issue: "1023" },
    { id: "service-platforms", label: "Service Platforms", title: "Service Platforms", icon: Layers, issue: "1024" },
    { id: "real-estate", label: "Real Estate", title: "Real Estate Platforms", icon: Home, issue: "1025" },
];

export default function UseCasesPage() {
    const [activeSection, setActiveSection] = useState("");
    const [isNavPinned, setIsNavPinned] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.3, rootMargin: "-20% 0px -50% 0px" }
        );

        USE_CASES.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        const handleScroll = () => {
            if (navRef.current) {
                setIsNavPinned(navRef.current.getBoundingClientRect().top <= 81);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 140;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="bg-[#F1F3F7] min-h-screen">
            <Navbar />

            <main>
                {/* ── Hero Section ── */}
                <section className="pt-40 pb-24 relative overflow-hidden">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "radial-gradient(circle at 50% 30%, rgba(20,154,155,0.08) 0%, transparent 70%)",
                        }}
                    />

                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-medium uppercase tracking-[0.4em] mb-6"
                            style={{ color: "#149A9B" }}
                        >
                            Industry Solutions
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black tracking-tight mb-8"
                            style={{ color: "#19213D" }}
                        >
                            Orchestrating Every <br className="hidden md:block" /> Payment Workflow
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-12"
                            style={{ color: "#6D758F" }}
                        >
                            Whether you&apos;re building a global marketplace or a decentralized payroll system,
                            OFFER HUB provides the non-custodial rails to move funds securely on Stellar.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-px h-12 bg-gradient-to-b from-[#149A9B]/40 to-transparent" />
                        </motion.div>
                    </div>
                </section>

                {/* ── Sticky Navigation (Neumorphic Pill) ── */}
                <div ref={navRef} className="sticky top-[80px] z-40 py-6 pointer-events-none">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-center">
                        <motion.div
                            className={cn(
                                "pointer-events-auto flex items-center p-1.5 rounded-2xl transition-all duration-500",
                                isNavPinned ? "shadow-nav-scrolled" : "shadow-nav"
                            )}
                            style={{ background: "#F1F3F7" }}
                        >
                            <div className="flex items-center gap-1">
                                {USE_CASES.map((section) => (
                                    <a
                                        key={section.id}
                                        id={`nav-link-${section.id}`}
                                        href={`#${section.id}`}
                                        onClick={(e) => handleNavClick(e, section.id)}
                                        className={cn(
                                            "relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300",
                                            activeSection === section.id
                                                ? "text-white shadow-raised-sm"
                                                : "text-[#6D758F] hover:text-[#19213D] hover:bg-white/50"
                                        )}
                                        style={{
                                            backgroundColor: activeSection === section.id ? "#149A9B" : "transparent",
                                        }}
                                    >
                                        {section.label}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Use Case Sections ── */}
                <div className="relative">
                    {USE_CASES.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <section
                                key={section.id}
                                id={section.id}
                                className={cn(
                                    "py-32 scroll-mt-24 relative overflow-hidden",
                                    index % 2 === 0 ? "bg-white" : "bg-[#F1F3F7]"
                                )}
                            >
                                {/* Visual accent for background separation */}
                                {index % 2 !== 0 && (
                                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d1d5db]/30 to-transparent" />
                                )}

                                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                                    <div className="grid grid-cols-1 gap-16 items-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            className="text-center"
                                        >
                                            <div
                                                className="w-14 h-14 rounded-2xl shadow-raised mx-auto mb-8 flex items-center justify-center transition-transform duration-500 hover:scale-110"
                                                style={{ background: "#F1F3F7" }}
                                            >
                                                <Icon size={20} style={{ color: "#149A9B" }} />
                                            </div>

                                            <h2
                                                className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
                                                style={{ color: "#19213D" }}
                                            >
                                                {section.title}
                                            </h2>

                                            <p
                                                className="text-lg font-light max-w-2xl mx-auto mb-16 leading-relaxed"
                                                style={{ color: "#6D758F" }}
                                            >
                                                Secure, programmable fund flows tailor-made for {section.label.toLowerCase()} applications.
                                                Minimize counterparty risk while maximizing operational efficiency with automated on-chain settlement.
                                            </p>

                                            {/* Placeholder Content Area */}
                                            <motion.div
                                                className="relative overflow-hidden h-[400px] md:h-[550px] rounded-[2.5rem] shadow-sunken w-full max-w-5xl mx-auto bg-[#F1F3F7]/50 flex items-center justify-center border border-white/40 group"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                viewport={{ once: true }}
                                            >
                                                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                                                <div className="relative text-center p-8">
                                                    <div className="w-20 h-20 rounded-3xl bg-white shadow-raised mx-auto mb-6 flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#149A9B]/30 animate-spin" style={{ animationDuration: '8s' }} />
                                                    </div>
                                                    <h3 className="text-[#19213D]/40 font-bold tracking-widest uppercase text-xs">
                                                        Case Study: {section.label} Architecture
                                                    </h3>
                                                    <div className="mt-8 flex justify-center gap-4">
                                                        <div className="w-12 h-2 rounded-full bg-[#149A9B]/5" />
                                                        <div className="w-24 h-2 rounded-full bg-[#149A9B]/10" />
                                                        <div className="w-12 h-2 rounded-full bg-[#149A9B]/5" />
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-8 right-8 text-[10px] font-bold tracking-widest text-[#149A9B]/30 uppercase">
                                                    Ref: Issue #{section.issue}
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}
