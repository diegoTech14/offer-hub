"use client";

import { useState, useMemo } from "react";

const tabs = [
  "Getting Started",
  "Account & Profile",
  "Projects & Payments",
  "Troubleshooting",
];

const content: Record<
  string,
  { title: string; description: string; new?: boolean }[]
> = {
  "Getting Started": [
    {
      title: "Creating Your Account",
      description: "Step-by-step guide on registering a new account.",
    },
    {
      title: "Building Your Profile",
      description: "Tips for creating a strong and trustworthy profile.",
    },
    {
      title: "Finding Your Project",
      description: "How to browse and find the right project for you.",
    },
    {
      title: "Posting Your First Job",
      description: "Guide to publishing your first job as a client.",
      new: true,
    },
  ],
  "Account & Profile": [
    {
      title: "Managing Account Settings",
      description: "Update your personal details and preferences.",
    },
    {
      title: "Security Best Practices",
      description: "Protect your account with 2FA and other tips.",
    },
    {
      title: "Notification Settings",
      description: "Customize how and when you receive updates.",
    },
    {
      title: "Linking Social Accounts",
      description: "Connect Facebook, Google, and more to your profile.",
      new: true,
    },
  ],
  "Projects & Payments": [
    {
      title: "Creating Milestones",
      description: "How to break down projects into manageable milestones.",
    },
    {
      title: "Payment Methods",
      description:
        "Overview of available payment options and how to set them up.",
    },
    {
      title: "Contracts & Agreements",
      description: "Understanding the legal aspects of freelance contracts.",
    },
    {
      title: "Dispute Resolution",
      description: "Steps to take if there’s a disagreement about a project.",
      new: true,
    },
  ],
  Troubleshooting: [
    {
      title: "Login Issues",
      description: "Recover your account and resolve sign-in problems.",
    },
    {
      title: "Payment Troubleshooting",
      description: "Fix errors and delays in payment processing.",
    },
    {
      title: "Communicating Problems",
      description: "What to do when messaging or calls aren’t working.",
    },
    {
      title: "Mobile App Troubleshooting",
      description: "Fix bugs and performance issues on the mobile app.",
      new: true,
    },
  ],
};

interface HelpTopicsTabsProps {
  searchQuery?: string;
}

export default function HelpTopicsTabs({ searchQuery = "" }: HelpTopicsTabsProps) {
  const [activeTab, setActiveTab] = useState("Getting Started");

  // Filter content based on search query
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return content[activeTab];
    }

    const query = searchQuery.toLowerCase();
    return content[activeTab].filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery]);

  // Count results across all tabs
  const totalResults = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    
    const query = searchQuery.toLowerCase();
    let count = 0;
    Object.values(content).forEach((items) => {
      count += items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      ).length;
    });
    return count;
  }, [searchQuery]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
        {searchQuery ? `Search Results for "${searchQuery}"` : "Browse Help Topics"}
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        {searchQuery
          ? `Found ${totalResults} article${totalResults !== 1 ? "s" : ""} matching your search`
          : "Explore our comprehensive guides and tutorials to get the most out of Offer Hub"}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              tab === activeTab
                ? "bg-gradient-to-r from-[#15949C] to-[#117a81] text-white shadow-md hover:shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {filteredContent.length > 0 ? (
          filteredContent.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-[#15949C]/30 dark:hover:shadow-gray-900/20 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#002333] dark:text-white">{item.title}</h3>
                {item.new && (
                  <span className="bg-[#15949C]/10 dark:bg-[#15949C]/20 text-[#15949C] dark:text-[#15949C] text-xs font-semibold px-2.5 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {item.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[#15949C] dark:text-[#15949C] text-sm font-medium hover:underline transition-all"
              >
                Read article →
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We couldn't find any articles matching "{searchQuery}" in this category.
            </p>
            <button
              onClick={() => setActiveTab(tabs[0])}
              className="text-[#15949C] hover:underline font-medium"
            >
              Try a different category
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
