import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

// Mock freelancer data
const mockFreelancers = Array.from({ length: 20 }, (_, i) => ({
  id: `freelancer_${i + 1}`,
  name: faker.person.fullName(),
  reputation_score: faker.number.int({ min: 60, max: 100 }), // Only high-quality freelancers
}));

// Mock services data
const generateMockServices = () => {
  const categories = ['development', 'design', 'marketing', 'business', 'data', 'security', 'blockchain'];
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `service_${i + 1}`,
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    category: categories[faker.number.int({ min: 0, max: categories.length - 1 })],
    min_price: faker.number.int({ min: 25, max: 150 }),
    max_price: faker.number.int({ min: 150, max: 500 }),
    freelancer: mockFreelancers[faker.number.int({ min: 0, max: mockFreelancers.length - 1 })],
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
  }));
};

const mockServices = generateMockServices();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min');
    const maxPrice = searchParams.get('max');
    
    let filteredServices = [...mockServices];
    
    // Apply filters
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filteredServices = filteredServices.filter(service => 
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category) {
      filteredServices = filteredServices.filter(service => 
        service.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredServices = filteredServices.filter(service => service.min_price >= min);
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredServices = filteredServices.filter(service => service.max_price <= max);
    }
    
    // Pagination
    const totalServices = filteredServices.length;
    const totalPages = Math.ceil(totalServices / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);
    
    // Response format matching the expected structure
    const response = {
      success: true,
      message: 'Services retrieved successfully',
      data: paginatedServices,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_services: totalServices,
        per_page: limit,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in services API:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: [],
        pagination: null,
      },
      { status: 500 }
    );
  }
}
