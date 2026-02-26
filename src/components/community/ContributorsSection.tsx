"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GitCommit, ChevronDown } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

interface ContributorData {
  name: string;
  username: string;
  avatar: string;
  commits: number;
  profileUrl: string;
}

interface ContributorsSectionProps {
  contributors: ContributorData[];
}

const ContributorsSection = ({ contributors }: ContributorsSectionProps) => {
  const [displayCount, setDisplayCount] = useState(30);
  const totalContributors = contributors.length;

  const visibleContributors = contributors.slice(0, displayCount);
  const hasMore = displayCount < totalContributors;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 30, totalContributors));
  };

  return (
    <section id="contributors" className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contributors"
          title="Meet the people shipping OFFER-HUB"
          subtitle={`Meet the developers shipping OFFER-HUB every day. A growing community of ${totalContributors} contributors.`}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-12">
          <AnimatePresence mode="popLayout">
            {visibleContributors.map((person, index) => (
              <motion.article
                key={person.username}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: (index % 30) * 0.02,
                  ease: "easeOut",
                }}
                className="group relative rounded-2xl bg-[#F1F3F7] p-5 shadow-raised transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-14 h-14 rounded-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#F1F3F7] flex items-center justify-center">
                      <Users size={20} className="text-[#6D758F]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#19213D] truncate tracking-tight">
                      {person.name || person.username}
                    </h3>
                    <p className="text-xs font-medium text-[#149A9B]">
                      @{person.username}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6D758F]/60">
                    <GitCommit size={12} />
                    <span>{person.commits} commits</span>
                  </div>

                  {person.profileUrl && (
                    <a
                      href={person.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-[10px] font-bold text-[#149A9B] hover:underline"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#149A9B] hover:gap-3 transition-all"
            >
              Load more contributors
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContributorsSection;
