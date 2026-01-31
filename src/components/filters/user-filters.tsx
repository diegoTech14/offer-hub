"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FilterLoading, FilterSkeleton } from "./filter-loading";

interface UserFiltersProps {
  onFiltersChange?: (filters: UserFilterState) => void;
  isLoading?: boolean;
  className?: string;
}

interface UserFilterState {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  date: Date | undefined;
  userType: "Freelancer" | "Customer" | "User" | "All";
}

export function UserFilters({ 
  onFiltersChange, 
  isLoading = false, 
  className 
}: UserFiltersProps) {
  const [filters, setFilters] = useState<UserFilterState>({
    searchQuery: "",
    roleFilter: "All",
    statusFilter: "All",
    date: undefined,
    userType: "All" as "Freelancer" | "Customer" | "User" | "All"
  });

  const [isApplying, setIsApplying] = useState(false);

  const handleFilterChange = (key: keyof UserFilterState, value: string | Date | undefined) => {
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
    const clearedFilters: UserFilterState = {
      searchQuery: "",
      roleFilter: "All",
      statusFilter: "All",
      date: undefined,
      userType: "All" as "Freelancer" | "Customer" | "User" | "All"
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "date") return value !== undefined;
    if (key === "userType") return value !== "All";
    return value !== "All" && value !== "";
  }).length;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <FilterLoading className="mb-4" />
          <FilterSkeleton count={3} />
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
              placeholder="Search users..."
              className="pl-10"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              value={filters.roleFilter} 
              onValueChange={(value) => handleFilterChange("roleFilter", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.statusFilter} 
              onValueChange={(value) => handleFilterChange("statusFilter", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 border-[#B4B9C9] text-[#6D758F] rounded-sm hover:bg-gray-50 gap-2"
                  disabled={isLoading}
                >
                  <CalendarIcon className="h-4 w-4 text-[#6D758F]" />
                  {filters.date ? format(filters.date, "MM/dd/yy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => handleFilterChange("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.roleFilter !== "All" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Role: {filters.roleFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("roleFilter", "All")}
                  />
                </Badge>
              )}
              {filters.statusFilter !== "All" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.statusFilter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("statusFilter", "All")}
                  />
                </Badge>
              )}
              {filters.date && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(filters.date, "MM/dd/yy")}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("date", undefined)}
                  />
                </Badge>
              )}
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.searchQuery}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("searchQuery", "")}
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
              disabled={activeFiltersCount === 0 || isLoading}
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              disabled={isApplying || isLoading}
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
