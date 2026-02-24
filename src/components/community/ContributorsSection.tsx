"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
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
  return (
    <section id="contributors" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contributors"
          title="Meet the people shipping OFFER-HUB"
          subtitle="Meet the developers shipping OFFER-HUB every day."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contributors.map((person, index) => (
            <motion.article
              key={person.username}
              className="rounded-2xl bg-background p-6 shadow-raised"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              {person.avatar ? (
                <img 
                  src={person.avatar} 
                  alt={person.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Users size={18} className="text-primary" />
              )}
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                {person.name}
              </h3>
              <p className="mt-1 text-sm font-light text-text-secondary">
                @{person.username}
              </p>
              <p className="mt-4 text-sm font-medium text-text-primary">
                {person.commits} commits
              </p>
              {person.profileUrl && (
                <a
                  href={person.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
                >
                  View Profile
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContributorsSection;
