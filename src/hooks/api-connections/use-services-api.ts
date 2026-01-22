"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  ServiceFilters, 
  ServicesListResponse, 
  ServiceWithFreelancer,
  FreelancerDisplay,
  UseServicesApiReturn 
} from '@/types/service.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to map service data to freelancer display format
function mapServiceToFreelancerDisplay(service: ServiceWithFreelancer): FreelancerDisplay {
  // Extract skills from description or use default skills based on category
  const getSkillsFromCategory = (category: string): string[] => {
    const skillMap: Record<string, string[]> = {
      'development': ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Web Development'],
      'design': ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'Visual Design'],
      'marketing': ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Google Analytics'],
      'business': ['Financial Analysis', 'Business Planning', 'Strategy', 'Consulting'],
      'data': ['Machine Learning', 'Python', 'Data Analysis', 'Statistics', 'NLP'],
      'security': ['Cryptography', 'Blockchain', 'Security Analysis', 'Rust', 'C++'],
      'blockchain': ['Solidity', 'Cairo', 'Soroban', 'DeFi', 'Smart Contracts'],
    };
    
    return skillMap[category.toLowerCase()] || ['General Skills'];
  };

  // Generate a realistic rating based on reputation score or random
  const getRating = (reputationScore?: number): number => {
    if (reputationScore) {
      // Map reputation score (0-100) to rating (1-5)
      return Math.max(1, Math.min(5, (reputationScore / 20) + 3));
    }
    // Random rating between 3.5 and 5 for demo purposes
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
  };

  // Generate review count based on rating
  const getReviewCount = (rating: number): number => {
    const baseCount = Math.floor(Math.random() * 100) + 20;
    return Math.floor(baseCount * (rating / 4));
  };

  // Generate response time based on rating
  const getResponseTime = (rating: number): string => {
    if (rating >= 4.5) return 'Under 1 hour';
    if (rating >= 4) return '1-2 hours';
    if (rating >= 3.5) return '2-3 hours';
    return 'Under 3 hours';
  };

  // Generate projects completed based on rating and experience
  const getProjectsCompleted = (rating: number): number => {
    const baseProjects = Math.floor(Math.random() * 50) + 10;
    return Math.floor(baseProjects * (rating / 4));
  };

  // Generate location (placeholder for now)
  const getLocation = (): string => {
    const locations = [
      'New York, USA', 'London, UK', 'San Francisco, USA', 'Toronto, Canada',
      'Berlin, Germany', 'Miami, USA', 'Dubai, UAE', 'Tokyo, Japan',
      'Barcelona, Spain', 'Moscow, Russia', 'Buenos Aires, Argentina'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const rating = getRating(service.freelancer.reputation_score);
  const reviewCount = getReviewCount(rating);
  const responseTime = getResponseTime(rating);
  const projectsCompleted = getProjectsCompleted(rating);
  const location = getLocation();
  const skills = getSkillsFromCategory(service.category);

  return {
    id: service.id,
    name: service.freelancer.name || 'Anonymous Freelancer',
    title: service.title,
    avatar: service.freelancer.avatar_url || undefined,
    rating,
    reviewCount,
    location,
    hourlyRate: service.min_price, // Use min_price as hourly rate
    description: service.description,
    skills,
    projectsCompleted,
    responseTime,
    category: service.category,
  };
}

export function useServicesApi(): UseServicesApiReturn {
  const [services, setServices] = useState<FreelancerDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current_page: number;
    total_pages: number;
    total_services: number;
    per_page: number;
  } | null>(null);

  // URL sync hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track if we're updating URL to prevent infinite loops
  const isUpdatingURL = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Helper function to update URL with search parameters
  const updateURL = useCallback((filters: ServiceFilters) => {
    if (isUpdatingURL.current) return; // Prevent recursive updates
    
    isUpdatingURL.current = true;
    
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove parameters based on filters
    if (filters.keyword) {
      params.set('q', filters.keyword);
    } else {
      params.delete('q');
    }
    
    if (filters.category) {
      params.set('category', filters.category);
    } else {
      params.delete('category');
    }
    
    if (filters.min_price !== undefined) {
      params.set('min', filters.min_price.toString());
    } else {
      params.delete('min');
    }
    
    if (filters.max_price !== undefined) {
      params.set('max', filters.max_price.toString());
    } else {
      params.delete('max');
    }
    
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    } else {
      params.delete('page');
    }
    
    // Always use 6 as limit, don't include in URL
    params.delete('limit');

    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [searchParams, router, pathname]);

  // Helper function to parse URL parameters into filters
  const parseURLParams = useCallback((): ServiceFilters => {
    const filters: ServiceFilters = {
      page: 1,
      limit: 6
    };

    const keyword = searchParams.get('q');
    if (keyword) filters.keyword = keyword;

    const category = searchParams.get('category');
    if (category) filters.category = category;

    const minPrice = searchParams.get('min');
    if (minPrice) filters.min_price = parseFloat(minPrice);

    const maxPrice = searchParams.get('max');
    if (maxPrice) filters.max_price = parseFloat(maxPrice);

    const page = searchParams.get('page');
    if (page) filters.page = parseInt(page);

    // Always use 6 as limit, ignore URL limit parameter
    // const limit = searchParams.get('limit');
    // if (limit) filters.limit = parseInt(limit);

    return filters;
  }, [searchParams]);

  // Mock data for freelancers - simulating database response
  const mockFreelancers: FreelancerDisplay[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Senior React Developer",
      avatar: "/avatars/sarah.jpg",
      rating: 4.9,
      reviewCount: 127,
      location: "San Francisco, USA",
      hourlyRate: 75,
      description: "Experienced React developer with 5+ years building scalable web applications. Specialized in modern React patterns and state management.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      projectsCompleted: 89,
      responseTime: "Under 1 hour",
      category: "development"
    },
    {
      id: "2", 
      name: "Michael Chen",
      title: "UI/UX Designer",
      avatar: "/avatars/michael.jpg",
      rating: 4.8,
      reviewCount: 95,
      location: "New York, USA",
      hourlyRate: 60,
      description: "Creative UI/UX designer focused on creating intuitive and beautiful user experiences. Expert in design systems and prototyping.",
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
      projectsCompleted: 67,
      responseTime: "Under 1 hour",
      category: "design"
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      title: "Full Stack Developer",
      avatar: "/avatars/elena.jpg",
      rating: 4.7,
      reviewCount: 143,
      location: "Barcelona, Spain",
      hourlyRate: 55,
      description: "Passionate full-stack developer with expertise in both frontend and backend technologies. Loves clean code and modern architecture.",
      skills: ["JavaScript", "Python", "Django", "React", "PostgreSQL"],
      projectsCompleted: 112,
      responseTime: "1-2 hours",
      category: "development"
    },
    {
      id: "4",
      name: "David Kim",
      title: "Digital Marketing Specialist",
      avatar: "/avatars/david.jpg",
      rating: 4.6,
      reviewCount: 78,
      location: "Toronto, Canada",
      hourlyRate: 45,
      description: "Results-driven digital marketing expert with proven track record in SEO, SEM, and social media campaigns.",
      skills: ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Content Marketing"],
      projectsCompleted: 54,
      responseTime: "1-2 hours",
      category: "marketing"
    },
    {
      id: "5",
      name: "Alexandra Smith",
      title: "Blockchain Developer",
      avatar: "/avatars/alexandra.jpg",
      rating: 4.9,
      reviewCount: 91,
      location: "London, UK",
      hourlyRate: 85,
      description: "Blockchain and smart contract developer with deep knowledge of Ethereum, Solidity, and DeFi protocols.",
      skills: ["Solidity", "Web3.js", "Ethereum", "DeFi", "Smart Contracts"],
      projectsCompleted: 43,
      responseTime: "Under 1 hour",
      category: "blockchain"
    },
    {
      id: "6",
      name: "James Wilson",
      title: "Data Scientist",
      avatar: "/avatars/james.jpg",
      rating: 4.8,
      reviewCount: 116,
      location: "Berlin, Germany",
      hourlyRate: 70,
      description: "Data scientist specializing in machine learning and AI. Expert in Python, R, and advanced analytics.",
      skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "Statistics"],
      projectsCompleted: 76,
      responseTime: "Under 1 hour",
      category: "data"
    },
    {
      id: "7",
      name: "Maria Garcia",
      title: "Business Consultant",
      avatar: "/avatars/maria.jpg",
      rating: 4.7,
      reviewCount: 89,
      location: "Miami, USA",
      hourlyRate: 65,
      description: "Strategic business consultant helping companies optimize operations and drive growth through data-driven insights.",
      skills: ["Business Strategy", "Financial Analysis", "Process Optimization", "Consulting", "Project Management"],
      projectsCompleted: 62,
      responseTime: "1-2 hours",
      category: "business"
    },
    {
      id: "8",
      name: "Ahmed Hassan",
      title: "Cybersecurity Expert",
      avatar: "/avatars/ahmed.jpg",
      rating: 4.9,
      reviewCount: 134,
      location: "Dubai, UAE",
      hourlyRate: 90,
      description: "Cybersecurity specialist with extensive experience in penetration testing, security audits, and vulnerability assessments.",
      skills: ["Penetration Testing", "Network Security", "Risk Assessment", "Compliance", "Incident Response"],
      projectsCompleted: 98,
      responseTime: "Under 1 hour",
      category: "security"
    },
    {
      id: "9",
      name: "Lisa Thompson",
      title: "Mobile App Developer",
      avatar: "/avatars/lisa.jpg",
      rating: 4.6,
      reviewCount: 102,
      location: "Tokyo, Japan",
      hourlyRate: 65,
      description: "Mobile app developer specializing in React Native and Flutter. Creates beautiful, performant cross-platform applications.",
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
      projectsCompleted: 71,
      responseTime: "1-2 hours",
      category: "development"
    },
    {
      id: "10",
      name: "Roberto Silva",
      title: "DevOps Engineer",
      avatar: "/avatars/roberto.jpg",
      rating: 4.8,
      reviewCount: 87,
      location: "Buenos Aires, Argentina",
      hourlyRate: 70,
      description: "DevOps engineer focused on automation, CI/CD, and cloud infrastructure. Expert in AWS, Docker, and Kubernetes.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      projectsCompleted: 58,
      responseTime: "Under 1 hour",
      category: "development"
    }
  ];

  const searchServices = useCallback(async (filters: ServiceFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update URL with current filters (but only if not already updating)
      if (!isUpdatingURL.current) {
        updateURL(filters);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Filter mock data based on search criteria
      let filteredFreelancers = [...mockFreelancers];

      // Apply keyword filter
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredFreelancers = filteredFreelancers.filter(freelancer =>
          freelancer.name.toLowerCase().includes(keyword) ||
          freelancer.title.toLowerCase().includes(keyword) ||
          freelancer.description.toLowerCase().includes(keyword) ||
          freelancer.skills.some(skill => skill.toLowerCase().includes(keyword))
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredFreelancers = filteredFreelancers.filter(freelancer =>
          freelancer.category === filters.category
        );
      }

      // Apply price filters
      if (filters.min_price !== undefined) {
        filteredFreelancers = filteredFreelancers.filter(freelancer =>
          freelancer.hourlyRate >= filters.min_price!
        );
      }

      if (filters.max_price !== undefined) {
        filteredFreelancers = filteredFreelancers.filter(freelancer =>
          freelancer.hourlyRate <= filters.max_price!
        );
      }

      // Simulate pagination
      const page = filters.page || 1;
      const limit = filters.limit || 6;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);

      // Simulate pagination metadata
      const totalPages = Math.ceil(filteredFreelancers.length / limit);
      const mockPagination = {
        current_page: page,
        total_pages: totalPages,
        total_services: filteredFreelancers.length,
        per_page: limit
      };

      setServices(paginatedFreelancers);
      setPagination(mockPagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      setError(errorMessage);
      setServices([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateURL]);

  // Debounced search function
  const debouncedSearch = useCallback(async (filters: ServiceFilters, delay: number = 300) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Return a Promise that resolves when the search is complete
    return new Promise<void>((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        await searchServices(filters);
        resolve();
      }, delay);
    });
  }, [searchServices]);

  // Load initial data from URL parameters only on mount or when URL actually changes
  useEffect(() => {
    const urlFilters = parseURLParams();
    
    // Only search if we're not currently updating the URL
    if (!isUpdatingURL.current) {
      searchServices(urlFilters);
    }
  }, [searchParams.toString()]); // Use searchParams.toString() to detect actual changes

  return {
    services,
    isLoading,
    error,
    pagination,
    searchServices: debouncedSearch,
    clearError,
  };
}
