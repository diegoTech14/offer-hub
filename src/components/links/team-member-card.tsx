import Image from 'next/image';
import { Github, Linkedin } from 'lucide-react';

import type { TeamMember } from '@/types/team-types';
import { cn } from '@/lib/utils';

interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function TeamMemberCard({ member, variant = 'secondary', className }: TeamMemberCardProps) {
  const isPrimary = variant === 'primary';
  const imagePosition = member.name.includes('Josué') ? 'object-top' : 'object-center';

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800/40 dark:bg-gray-900',
        isPrimary && 'border-primary-200 shadow-xl dark:border-primary-800',
        className
      )}
    >
      <div className="relative w-full overflow-hidden pt-[90%]">
        <Image
          src={member.avatarSrc ?? '/profile-placeholder.jpg'}
          alt={`Portrait of ${member.name}`}
          fill
          sizes="320px"
          className={cn('absolute inset-0 object-cover', imagePosition)}
          priority={false}
        />
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-5 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-300">
          {member.role}
        </p>

        <div className="mt-5 flex items-center justify-center gap-4 text-gray-500 dark:text-gray-300">
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`LinkedIn of ${member.name}`}
              className="transition hover:text-primary-600 dark:hover:text-primary-200"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.githubUrl && (
            <a
              href={member.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`GitHub of ${member.name}`}
              className="transition hover:text-primary-600 dark:hover:text-primary-200"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
