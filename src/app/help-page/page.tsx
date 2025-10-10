"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HelpCategoryCards from "../../components/help/help-category-cards";
import HelpTopicsTabs from "@/components/help/help-topics-taps";
import ContactSupport from "@/components/help/contact-support";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const topicsRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Scroll to topics section
      topicsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] dark:from-gray-900 dark:to-gray-800 text-white py-16 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-48 -translate-x-48"></div>
          </div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">We're here to help you</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                How Can We
                <span className="block bg-gradient-to-r from-white to-[#DEEFE7] bg-clip-text text-transparent">
                  Help You?
                </span>
              </h1>

              <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Find answers, resources, and support to make the most of Offer Hub
              </p>

              <div className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-32 py-6 rounded-2xl text-gray-900 dark:text-white text-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-white/20 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 shadow-2xl focus:shadow-3xl transition-all duration-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                  <Button 
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-gradient-to-r from-[#15949C] to-[#117a81] hover:from-[#117a81] hover:to-[#0d5f65] px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HelpCategoryCards />
        <div ref={topicsRef}>
          <HelpTopicsTabs searchQuery={searchQuery} />
        </div>
        <ContactSupport />
      </main>

      <Footer />
    </div>
  );
}
