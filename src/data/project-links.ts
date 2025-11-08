import type { ProjectLink, TeamMember } from '@/types/team-types';

export const projectLinks: ProjectLink[] = [
  {
    title: 'OFFER-HUB Official Website',
    description: 'Main product experience available at offer-hub.org.',
    url: 'https://www.offer-hub.org',
    icon: '/offer_hub_logo.png',
  },
  {
    title: 'OFFER-HUB GitHub Repository',
    description: 'Open-source codebase powering the OFFER-HUB ecosystem.',
    url: 'https://github.com/OFFER-HUB/offer-hub',
  },
  {
    title: 'GrantFox Campaign',
    description: 'Support OFFER-HUB through our GrantFox campaign.',
    url: 'https://contribute.grantfox.xyz/campaigns/org/OFFER-HUB',
    icon: '/grant-fox.png',
  },
  {
    title: 'OFFER-HUB Telegram Contributors',
    description: 'Join the contributor community on Telegram.',
    url: 'https://t.me/offer_hub_contributors',
    icon: '/icons/telegram.svg',
  },
  {
    title: 'OFFER-HUB on X',
    description: 'Follow OFFER-HUB updates on X (Twitter).',
    url: 'https://x.com/offerhub_',
    icon: '/icons/x-logo.svg',
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: 'Josué Araya',
    role: 'CEO',
    avatarSrc: '/team/Josué.jpeg',
    githubUrl: 'https://github.com/Josue19-08',
    linkedinUrl: 'https://www.linkedin.com/in/josue-araya-marin-336975245/',
  },
  {
    name: 'Karla Garita',
    role: 'CPO',
    avatarSrc: '/team/Karla.jpeg',
    linkedinUrl: 'https://www.linkedin.com/in/karlagaritar/',
  },
  {
    name: 'Kevin Brenes',
    role: 'CTO',
    avatarSrc: '/team/Kevin.jpeg',
    githubUrl: 'https://github.com/KevinMB0220',
    linkedinUrl: 'https://www.linkedin.com/in/kevin-brenes-2a9750261',
  },
];
