export interface TeamMember {
  name: string;
  role: 'CEO' | 'CTO' | 'CPO';
  avatarSrc: string;
  githubUrl?: string;
  linkedinUrl: string;
}

export interface ProjectLink {
  title: string;
  description: string;
  url: string;
  icon?: string;
}
