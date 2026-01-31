/**
 * @fileoverview Private landing page with official links and executive team
 */

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { projectLinks, teamMembers } from '@/data/project-links';
import { ProjectLinkCard } from '@/components/links/project-link-card';
import { TeamMemberCard } from '@/components/links/team-member-card';

export const metadata = {
  title: 'OFFER-HUB | Private Links',
  description: 'Direct access to OFFER-HUB official links and executive team profiles.',
};

export default function ProjectLinksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-50 via-white to-white py-14 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <span className="rounded-full bg-primary-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              Private access
            </span>
            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              OFFER-HUB official resources
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Curated shortcuts to the live product and source code, plus the leadership team behind OFFER-HUB.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Highlighted links</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {projectLinks.map((link) => (
              <ProjectLinkCard key={link.url} link={link} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Leadership team</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.name} member={member} variant={index === 0 ? 'primary' : 'secondary'} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
