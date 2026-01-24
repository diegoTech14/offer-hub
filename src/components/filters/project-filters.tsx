"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Loader2 } from "lucide-react";
import { FilterLoading, FilterSkeleton, FilterItemLoading } from "./filter-loading";

interface ProjectFiltersProps {
  onFiltersChange?: (filters: ProjectFilterState) => void;
  isLoading?: boolean;
  className?: string;
}

interface ProjectFilterState {
  searchQuery: string;
  status: string;
  category: string;
  budgetRange: string;
  dateRange: string;
  skills: string[];
}

export function ProjectFilters({ 
  onFiltersChange, 
  isLoading = false, 
  className 
}: ProjectFiltersProps) {
  const [filters, setFilters] = useState<ProjectFilterState>({
    searchQuery: "",
    status: "all",
    category: "all", 
    budgetRange: "all",
    dateRange: "all",
    skills: []
  });

  const [isApplying, setIsApplying] = useState(false);

  const handleFilterChange = (key: keyof ProjectFilterState, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyFilters = async () => {
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
    }, 1000);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: "",
      status: "all",
      category: "all",
      budgetRange: "all", 
      dateRange: "all",
      skills: []
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== "all" && value !== ""
  ).length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <FilterLoading className="mb-4" />
          <FilterSkeleton count={4} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Project Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="mobile-development">Mobile Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.budgetRange} onValueChange={(value) => handleFilterChange("budgetRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="0-500">$0 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="5000+">$5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.status !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("status", "all")}
                  />
                </Badge>
              )}
              {filters.category !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("category", "all")}
                  />
                </Badge>
              )}
              {filters.budgetRange !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Budget: {filters.budgetRange}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("budgetRange", "all")}
                  />
                </Badge>
              )}
              {filters.skills.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Skills: {filters.skills.length}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("skills", [])}
                  />
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              disabled={isApplying}
              className="bg-[#15949C] hover:bg-[#15949C]/90"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
