"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/landing-data";

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-[#DEEFE7]/30 dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#002333] dark:text-white mb-4">
            Popular Categories
          </h2>
          <p className="text-[#002333]/70 dark:text-gray-300 max-w-2xl mx-auto">
            Browse through the most in-demand services and find the perfect
            match for your project needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.link}
              className="
                group
                bg-white dark:bg-gray-900 
                rounded-lg 
                shadow-md hover:shadow-xl 
                dark:hover:shadow-gray-900/30 
                transition-all duration-300
                p-6 
                flex flex-col items-center text-center
                hover:-translate-y-2
                hover:border-[#15949C] border-2 border-transparent
                cursor-pointer
              "
            >
              <div className="
                w-16 h-16 rounded-full 
                bg-[#DEEFE7] dark:bg-gray-700 
                group-hover:bg-[#15949C]/10 dark:group-hover:bg-[#15949C]/20
                flex items-center justify-center mb-4
                transition-colors duration-300
              ">
                {category.icon}
              </div>
              <h3 className="
                text-xl font-semibold 
                text-[#002333] dark:text-white 
                group-hover:text-[#15949C] dark:group-hover:text-[#15949C]
                mb-2
                transition-colors duration-300
              ">
                {category.name}
              </h3>
              <p className="text-[#002333]/70 dark:text-gray-300 mb-4 flex-grow text-sm">
                {category.description}
              </p>
              <div className="
                text-[#15949C] dark:text-[#15949C] 
                font-medium 
                flex items-center 
                mt-auto
                group-hover:gap-2
                transition-all duration-300
              ">
                Explore
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Link */}
        <div className="mt-12 text-center">
          <Link
            href="/find-workers"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-[#15949C] hover:bg-[#117a81]
              text-white font-medium
              rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-200
              hover:scale-105
            "
          >
            View All Freelancers
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
