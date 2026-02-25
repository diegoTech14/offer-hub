import Image from "next/image";
import Link from "next/link";

export interface ContributorCardProps {
  avatar: string;
  username: string;
  contributions: number;
  profileUrl: string;
}

// paste this 👇 section in any component to test, note this can also be mapped over.
{
  /* <section className="py-16">
<div className="max-w-7xl mx-auto px-6 lg:px-8">
  <div className="mb-8 text-center">
    <p className="text-xs font-medium uppercase tracking-[0.36em] text-primary">
      Community preview
    </p>
    <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-text-primary">
      Example contributors
    </h2>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
    <ContributorCard
      avatar="https://avatars.githubusercontent.com/u/583231?v=4"
      username="octocat"
      contributions={42}
      profileUrl="https://github.com/octocat"
    />
    <ContributorCard
      avatar="https://avatars.githubusercontent.com/u/1?v=4"
      username="early-bird"
      contributions={7}
      profileUrl="https://github.com/early-bird"
    />
    <ContributorCard
      avatar="https://avatars.githubusercontent.com/u/2?v=4"
      username="very-long-username-that-wraps-nicely"
      contributions={120}
      profileUrl="https://github.com/very-long-username-that-wraps-nicely"
    />
    <ContributorCard
      avatar="https://avatars.githubusercontent.com/u/3?v=4"
      username="design-systems"
      contributions={5}
      profileUrl="https://github.com/design-systems"
    />
  </div>
</div>
</section> */
}

export default function ContributorCard({
  avatar,
  username,
  contributions,
  profileUrl,
}: ContributorCardProps) {
  return (
    <article className="w-full max-w-xs mx-auto rounded-2xl p-5 shadow-raised bg-background transition-shadow duration-[400ms] ease-out hover:shadow-raised-hover">
      <Link
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center text-center gap-2 sm:gap-3 no-underline text-inherit w-full h-full"
      >
        <Image
          src={avatar}
          alt={`${username} avatar`}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <h3 className="text-base font-semibold text-text-primary break-words text-center">
          {username}
        </h3>
        <p className="text-sm text-text-secondary">
          {contributions}{" "}
          {contributions === 1 ? "contribution" : "contributions"}
        </p>
      </Link>
    </article>
  );
}
