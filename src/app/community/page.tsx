import ContributorsSection from "@/components/community/ContributorsSection";
import CommunityChannelsSection from "@/components/community/CommunityChannelsSection";
import HeroRepoStatsSection from "@/components/community/HeroRepoStatsSection";
import HowToContributeSection from "@/components/community/HowToContributeSection";
import OpenIssuesSection from "@/components/community/OpenIssuesSection";
import RecentPRsSection from "@/components/community/RecentPRsSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

interface RepoStats {
  stars: string;
  forks: string;
  contributors: string;
  openIssues: string;
}

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface ContributorData {
  name: string;
  username: string;
  avatar: string;
  commits: number;
  profileUrl: string;
}

interface PullRequestData {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
  status: string;
}

interface IssueData {
  number: number;
  title: string;
  priority: string;
  url: string;
  labels: string[];
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  merged_at: string | null;
  user: {
    login: string;
  } | null;
}

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  pull_request?: object;
  labels: Array<{
    name: string;
  }>;
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return "1 week ago";
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return "1 month ago";
  return `${Math.floor(diffInDays / 30)} months ago`;
}

async function fetchGitHubData() {
  try {
    const [repoResponse, contributorsResponse, pullRequestsResponse, issuesResponse] = await Promise.all([
      fetch('https://api.github.com/repos/OFFER-HUB/offer-hub-monorepo', {
        next: { revalidate: 3600 },
      }),
      fetch('https://api.github.com/repos/OFFER-HUB/offer-hub-monorepo/contributors', {
        next: { revalidate: 3600 },
      }),
      fetch('https://api.github.com/repos/OFFER-HUB/offer-hub-monorepo/pulls?state=closed&sort=updated&per_page=20', {
        next: { revalidate: 3600 },
      }),
      fetch('https://api.github.com/repos/OFFER-HUB/offer-hub-monorepo/issues?state=open&per_page=20', {
        next: { revalidate: 3600 },
      }),
    ]);

    if (!repoResponse.ok || !contributorsResponse.ok || !pullRequestsResponse.ok || !issuesResponse.ok) {
      throw new Error('Failed to fetch repo data');
    }

    const repoData: GitHubRepo = await repoResponse.json();
    const contributorsData: Contributor[] = await contributorsResponse.json();
    const pullRequestsData: GitHubPullRequest[] = await pullRequestsResponse.json();
    const issuesData: GitHubIssue[] = await issuesResponse.json();

    const stats: RepoStats = {
      stars: formatNumber(repoData.stargazers_count),
      forks: formatNumber(repoData.forks_count),
      contributors: formatNumber(contributorsData.length),
      openIssues: formatNumber(repoData.open_issues_count),
    };

    const contributors: ContributorData[] = contributorsData.map((contributor) => ({
      name: contributor.login,
      username: contributor.login,
      avatar: contributor.avatar_url,
      commits: contributor.contributions,
      profileUrl: contributor.html_url,
    }));

    const mergedPRs = pullRequestsData
      .filter((pr) => pr.merged_at !== null);

    const pullRequests: PullRequestData[] = mergedPRs.map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || "Unknown",
      mergedAt: formatTimeAgo(pr.merged_at!),
      url: pr.html_url,
      status: "Merged",
    }));

    const actualIssues = issuesData
      .filter((issue) => !issue.pull_request)

    const issues: IssueData[] = actualIssues.map((issue) => {
      const priorityLabel = issue.labels.find((label) => 
        label.name.toLowerCase().includes('priority')
      );
      
      let priority = "Medium";
      if (priorityLabel) {
        const labelName = priorityLabel.name.toLowerCase();
        if (labelName.includes('high') || labelName.includes('critical')) {
          priority = "High";
        } else if (labelName.includes('low')) {
          priority = "Low";
        }
      }

      return {
        number: issue.number,
        title: issue.title,
        priority,
        url: issue.html_url,
        labels: issue.labels.map((label) => label.name),
      };
    });

    return { stats, contributors, pullRequests, issues };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return {
      stats: {
        stars: "4.8k",
        forks: "1.2k",
        contributors: "182",
        openIssues: "74",
      },
      contributors: [
        { name: "Ada M.", username: "ada-m", avatar: "", commits: 248, profileUrl: "" },
        { name: "Dami O.", username: "dami-o", avatar: "", commits: 133, profileUrl: "" },
        { name: "Hassan K.", username: "hassan-k", avatar: "", commits: 92, profileUrl: "" },
        { name: "Lina S.", username: "lina-s", avatar: "", commits: 87, profileUrl: "" },
        { name: "Marta P.", username: "marta-p", avatar: "", commits: 76, profileUrl: "" },
        { name: "Tomi A.", username: "tomi-a", avatar: "", commits: 70, profileUrl: "" },
      ],
      pullRequests: [
        { number: 1042, title: "feat: add account-level escrow analytics", author: "contributor1", mergedAt: "2 days ago", url: "", status: "Merged" },
        { number: 1039, title: "refactor: simplify wallet sync flow", author: "contributor2", mergedAt: "3 days ago", url: "", status: "Merged" },
        { number: 1036, title: "fix: resolve pagination edge case in jobs feed", author: "contributor3", mergedAt: "5 days ago", url: "", status: "Merged" },
        { number: 1033, title: "docs: add validator onboarding guide", author: "contributor4", mergedAt: "1 week ago", url: "", status: "Merged" },
      ],
      issues: [
        { number: 1055, title: "Improve CI cache invalidation strategy", priority: "Medium", url: "", labels: [] },
        { number: 1051, title: "Add e2e tests for payout cancellation", priority: "High", url: "", labels: [] },
        { number: 1048, title: "Expose webhook replay in dashboard", priority: "Low", url: "", labels: [] },
        { number: 1046, title: "Polish mobile nav focus styles", priority: "Low", url: "", labels: [] },
      ],
    };
  }
}

export default async function CommunityPage() {
  const { stats, contributors, pullRequests, issues } = await fetchGitHubData();

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroRepoStatsSection stats={stats} />
        <ContributorsSection contributors={contributors} />
        <RecentPRsSection pullRequests={pullRequests} />
        <OpenIssuesSection issues={issues} />
        <HowToContributeSection />
        <CommunityChannelsSection />
      </main>
      <Footer />
    </>
  );
}
