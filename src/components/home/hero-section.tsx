"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { popularTags } from "@/data/landing-data";
import { useSearch } from "@/hooks/use-search";
import SearchResults from "@/components/search/search-results";

// Example items array — replace with your actual data
const allItems = [
  { id: "1", title: "Web Development" },
  { id: "2", title: "Graphic Design" },
  { id: "3", title: "SEO Optimization" },
  { id: "4", title: "Content Writing" },
  { id: "5", title: "Mobile App Development" },
];

export default function HeroSection() {
  const { searchQuery, setSearchQuery,isLoading } = useSearch();

  // Filter results based on searchQuery
  const resultsArray = allItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="bg-gradient-to-r from-[#002333] to-[#15949C] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Find the perfect freelancer for your project
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Connect with skilled professionals ready to bring your ideas to life
          </p>

          {/* Search Input */}
          <div className="bg-white rounded-lg p-2 flex flex-col shadow-lg">
            <div className="flex items-center">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service are you looking for?"
                aria-label="Search services"
                className="
    border border-gray-300 
    dark:border-gray-600 
    bg-white dark:bg-gray-700 
    text-black dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400 
    focus-visible:ring-2 focus-visible:ring-[#15949C] 
    focus-visible:ring-offset-0 rounded-md 
    flex-1
  "
              />

              <Button className="bg-[#15949C] hover:bg-[#15949C]/90 ml-2">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchQuery && resultsArray.length > 0 && (
              <div className="mt-4 bg-white rounded-md p-2 text-black">
                <SearchResults
                  results={resultsArray}
                  showLoading
                  searchQuery={searchQuery}
                  isLoading={isLoading}
                />

              </div>
            )}
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <Badge
                key={index}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden md:block relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#DEEFE7] rounded-full opacity-30"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#DEEFE7] rounded-full opacity-30"></div>
          <div className="relative z-10 bg-white p-6 rounded-lg shadow-xl">
            <Image
              src="/logo.svg"
              alt="Freelancer working"
              width={500}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}