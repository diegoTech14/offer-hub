import ContributorsSection from "@/components/community/ContributorsSection";
import CommunityChannelsSection from "@/components/community/CommunityChannelsSection";
import HeroRepoStatsSection from "@/components/community/HeroRepoStatsSection";
import HowToContributeSection from "@/components/community/HowToContributeSection";
import OpenIssuesSection from "@/components/community/OpenIssuesSection";
import RecentPRsSection from "@/components/community/RecentPRsSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroRepoStatsSection />
        <ContributorsSection />
        <RecentPRsSection />
        <OpenIssuesSection />
        <HowToContributeSection />
        <CommunityChannelsSection />
      </main>
      <Footer />
    </>
  );
}
