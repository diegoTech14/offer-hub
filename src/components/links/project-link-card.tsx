import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';

import type { ProjectLink } from '@/types/team-types';
import { cn } from '@/lib/utils';

interface ProjectLinkCardProps {
  link: ProjectLink;
  className?: string;
}

export function ProjectLinkCard({ link, className }: ProjectLinkCardProps) {
  const isGithub = link.url.includes('github.com');

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'group flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative h-16 w-16 flex-shrink-0">
          {isGithub ? (
            <div className="flex h-full w-full items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-white">
              <Github className="h-8 w-8" />
            </div>
          ) : link.icon ? (
            <Image
              src={link.icon}
              alt={`${link.title} icon`}
              fill
              sizes="64px"
              className="object-contain"
            />
          ) : (
            <span className="text-4xl" aria-hidden>
              🔗
            </span>
          )}
        </div>
        <ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-400 transition group-hover:text-primary-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{link.title}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
      </div>
      <span className="mt-auto text-xs font-medium uppercase tracking-wide text-primary-600 group-hover:underline dark:text-primary-300">
        Visit
      </span>
    </a>
  );
}
