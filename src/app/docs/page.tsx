"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import DocsSearchBar from "@/components/docs/DocsSearchBar";
import { Book, Code, Shield, LifeBuoy, Terminal, Zap } from "lucide-react";
import Link from "next/link";

const docSections = [
    {
        icon: <Book className="text-[#149A9B]" />,
        title: "Project Overview",
        description: "Learn about the mission, architecture, and technology stack of Offer Hub.",
        link: "/docs/architecture",
        count: "3 articles"
    },
    {
        icon: <Code className="text-[#149A9B]" />,
        title: "Development",
        description: "Guides on naming conventions, code style, and how to contribute.",
        link: "/docs/contributing",
        count: "4 articles"
    },
    {
        icon: <Terminal className="text-[#149A9B]" />,
        title: "API Reference",
        description: "Detailed documentation for all backend API endpoints and responses.",
        link: "/docs/api-responses",
        count: "2 articles"
    },
    {
        icon: <Shield className="text-[#149A9B]" />,
        title: "Security & Auth",
        description: "Comprehensive guide to the authentication and authorization system.",
        link: "/docs/authentication",
        count: "1 article"
    },
    {
        icon: <Zap className="text-[#149A9B]" />,
        title: "Database",
        description: "Database schema design, migrations, and Supabase integration.",
        link: "/docs/database",
        count: "2 articles"
    },
    {
        icon: <LifeBuoy className="text-[#149A9B]" />,
        title: "Error Handling",
        description: "Standard practices for error handling across the entire stack.",
        link: "/docs/error-handling",
        count: "1 article"
    }
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hub Header */}
                <div className="bg-[#DEEFE7]/30 dark:bg-gray-900/50 py-20 border-b border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Offer Hub <span className="text-[#149A9B]">Documentation</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                            Everything you need to know about building, deploying, and contributing to the decentralized freelance marketplace.
                        </p>

                        <DocsSearchBar />
                    </div>
                </div>

                {/* Section Cards */}
                <div className="container mx-auto px-4 py-16 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {docSections.map((section, idx) => (
                            <Link
                                key={idx}
                                href={section.link}
                                className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-raised transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#DEEFE7]/50 dark:bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-[#149A9B]/10 transition-colors">
                                    {section.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#149A9B] transition-colors leading-tight">
                                    {section.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                    {section.description}
                                </p>
                                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>{section.count}</span>
                                    <span className="text-[#149A9B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        Explore <ChevronRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Support Section */}
                <div className="container mx-auto px-4 py-12 max-w-4xl text-center border-t border-gray-50 dark:border-gray-900">
                    <p className="text-gray-500 dark:text-gray-500 italic mb-4">
                        Cant find what youre looking for?
                    </p>
                    <div className="flex justify-center gap-6">
                        <Link href="/help" className="text-[#149A9B] font-semibold hover:underline">Help Center</Link>
                        <span className="text-gray-300">•</span>
                        <Link href="https://github.com/OFFER-HUB/offer-hub-monorepo/issues" className="text-[#149A9B] font-semibold hover:underline">GitHub Issues</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function ChevronRight({ size = 16, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
