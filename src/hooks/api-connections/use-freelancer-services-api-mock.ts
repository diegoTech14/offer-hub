"use client";

import { useState, useCallback } from 'react';
import { 
  FrontendService, 
  BackendService, 
  ServicesListApiResponse,
  CreateServiceDTO,
  UpdateServiceDTO,
  UseFreelancerServicesApiReturn
} from './use-freelancer-services-api';

// Mock services data for Olivia Rhye
const mockServices: FrontendService[] = [
  {
    id: "service_1",
    title: "Ergonomic full-range internet solution",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    category: "design",
    min_price: 55.000,
    max_price: 367.000,
    currency: "XLM",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "service_2", 
    title: "Advanced blockchain development",
    description: "Comprehensive blockchain solutions including smart contracts, DeFi protocols, and NFT marketplaces. Expert in Solidity, Cairo, and Soroban development with focus on security and scalability.",
    category: "blockchain",
    min_price: 120.000,
    max_price: 450.000,
    currency: "XLM",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "service_3",
    title: "Business strategy consulting",
    description: "Strategic business planning and consulting services for startups and established companies. Market analysis, financial planning, and growth strategy development.",
    category: "business", 
    min_price: 75.000,
    max_price: 200.000,
    currency: "XLM",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "service_4",
    title: "Full-stack web development",
    description: "Modern web applications using React, Node.js, and TypeScript. Responsive design, API development, and database integration. Mobile-first approach with optimal performance.",
    category: "development",
    min_price: 80.000,
    max_price: 300.000,
    currency: "XLM",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "service_5",
    title: "Digital marketing campaigns",
    description: "Comprehensive digital marketing strategies including SEO, SEM, social media marketing, and content creation. Data-driven approach with detailed analytics and reporting.",
    category: "marketing",
    min_price: 60.000,
    max_price: 180.000,
    currency: "XLM",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "service_6",
    title: "Data analysis and visualization",
    description: "Advanced data analysis using Python, R, and machine learning techniques. Interactive dashboards, statistical modeling, and business intelligence solutions.",
    category: "data",
    min_price: 90.000,
    max_price: 250.000,
    currency: "XLM",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString(),
  }
];

export function useFreelancerServicesApiMock(): UseFreelancerServicesApiReturn {
  const [services, setServices] = useState<FrontendService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserServices = useCallback(async (userId: string) => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return mock services
      setServices(mockServices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch services";
      setError(errorMessage);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createService = useCallback(async (userId: string, serviceData: CreateServiceDTO): Promise<boolean> => {
    if (!userId) {
      setError("User ID is required");
      return false;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new service with mock data
      const newService: FrontendService = {
        id: `service_${Date.now()}`,
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        min_price: serviceData.min_price,
        max_price: serviceData.max_price,
        currency: serviceData.currency || "XLM",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setServices(prev => [...prev, newService]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create service";
      setError(errorMessage);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateService = useCallback(async (serviceId: string, userId: string, updateData: UpdateServiceDTO): Promise<boolean> => {
    if (!userId || !serviceId) {
      setError("Service ID and User ID are required");
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update service in mock data
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId 
            ? { 
                ...service, 
                ...updateData, 
                updated_at: new Date().toISOString() 
              }
            : service
        )
      );
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update service";
      setError(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteService = useCallback(async (serviceId: string, userId: string): Promise<boolean> => {
    if (!userId || !serviceId) {
      setError("Service ID and User ID are required");
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Remove service from mock data
      setServices(prev => prev.filter(service => service.id !== serviceId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete service";
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    services,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createService,
    updateService,
    deleteService,
    fetchUserServices,
    clearError,
  };
}
