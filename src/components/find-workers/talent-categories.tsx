"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Smartphone, PenTool, FileText, BarChart, Video, Database, Server, ChevronRight } from "lucide-react"
import { VALIDATION_LIMITS } from "@/constants/magic-numbers"
import { FreelancerDisplay } from "@/types/service.types"
import { useMemo } from "react"

interface TalentCategoriesProps {
  services: FreelancerDisplay[]
  onCategoryClick?: (category: string) => void
  isLoading?: boolean
}

export default function TalentCategories({ services, onCategoryClick, isLoading = false }: TalentCategoriesProps) {
  // Calculate real category data from services
  const categoryData = useMemo(() => {
    const categoryMap = {
      development: { name: "Development", icon: <Code className="h-6 w-6 text-[#15949C]" />, apiKey: "development" },
      design: { name: "Design", icon: <PenTool className="h-6 w-6 text-[#15949C]" />, apiKey: "design" },
      business: { name: "Business", icon: <BarChart className="h-6 w-6 text-[#15949C]" />, apiKey: "business" },
      writing: { name: "Writing", icon: <FileText className="h-6 w-6 text-[#15949C]" />, apiKey: "writing" },
      video: { name: "Video & Animation", icon: <Video className="h-6 w-6 text-[#15949C]" />, apiKey: "video" },
      data: { name: "Data Science", icon: <Database className="h-6 w-6 text-[#15949C]" />, apiKey: "data" },
      mobile: { name: "Mobile", icon: <Smartphone className="h-6 w-6 text-[#15949C]" />, apiKey: "mobile" },
      cloud: { name: "Cloud & DevOps", icon: <Server className="h-6 w-6 text-[#15949C]" />, apiKey: "cloud" },
    }

    // Count services by category and collect skills
    const categoryCounts: Record<string, { count: number; skills: Set<string> }> = {}
    
    services.forEach(service => {
      const category = service.category || 'other'
      if (!categoryCounts[category]) {
        categoryCounts[category] = { count: 0, skills: new Set() }
      }
      categoryCounts[category].count++
      service.skills.forEach(skill => categoryCounts[category].skills.add(skill))
    })

    // Map to category objects
    return Object.entries(categoryCounts)
      .map(([key, data]) => ({
        id: key,
        name: categoryMap[key as keyof typeof categoryMap]?.name || key.charAt(0).toUpperCase() + key.slice(1),
        icon: categoryMap[key as keyof typeof categoryMap]?.icon || <Code className="h-6 w-6 text-[#15949C]" />,
        apiKey: key,
        count: data.count,
        skills: Array.from(data.skills).slice(0, 5),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [services])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categoryData.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <Card 
            className="h-full cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/20 hover:border-[#15949C] dark:hover:border-[#15949C]"
            onClick={() => onCategoryClick?.(category.apiKey)}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-[#DEEFE7] dark:bg-gray-700 flex items-center justify-center mr-3 group-hover:bg-[#15949C]/20 transition-colors">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#002333] dark:text-white">{category.name}</h3>
                  <p className="text-sm text-[#002333]/70 dark:text-gray-300">{category.count} services</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {category.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} className="bg-[#15949C]/10 text-[#15949C] border-[#15949C]/20 text-xs">
                    {skill}
                  </Badge>
                ))}
                {category.skills.length > 3 && (
                  <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-0 text-xs">
                    +{category.skills.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center text-[#15949C] dark:text-[#15949C] text-sm font-medium hover:gap-2 transition-all">
                Browse {category.name}
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

