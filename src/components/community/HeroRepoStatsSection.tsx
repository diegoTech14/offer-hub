"use client";

import { motion } from "framer-motion";

interface RepoStats {
  stars: string;
  forks: string;
  contributors: string;
  openIssues: string;
}

interface HeroRepoStatsSectionProps {
  stats: RepoStats;
}

const HeroRepoStatsSection = ({ stats }: HeroRepoStatsSectionProps) => {
  const repoStats = [
    { label: "Stars", value: stats.stars },
    { label: "Forks", value: stats.forks },
    { label: "Contributors", value: stats.contributors },
    { label: "Open Issues", value: stats.openIssues },
  ];
  return (
    <section id="hero-repo-stats" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="rounded-3xl bg-background p-8 shadow-raised md:p-10 lg:col-span-7">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-primary">
              Open Source Community
            </p>
            <h1 className="text-4xl font-black tracking-tight text-text-primary md:text-6xl">
              Build OFFER-HUB with us
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light text-text-secondary md:text-lg">
              A central hub for contributors, maintainers, and builders.
              Discover active work, collaborate on issues, and help shape the
              future of decentralized commerce tooling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            {repoStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl bg-background p-6 shadow-raised"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.55,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-medium text-text-secondary">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-black text-text-primary">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroRepoStatsSection;
