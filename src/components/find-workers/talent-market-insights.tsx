"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, DollarSign, Clock, BarChart2, Award } from "lucide-react"
import { FreelancerDisplay } from "@/types/service.types"
import { useMemo } from "react"

interface TalentMarketInsightsProps {
  services: FreelancerDisplay[]
  isLoading?: boolean
}

export default function TalentMarketInsights({ services, isLoading = false }: TalentMarketInsightsProps) {
  // Calculate real insights from services data
  const insights = useMemo(() => {
    if (!services || services.length === 0) {
      return {
        avgRate: 0,
        minRate: 0,
        maxRate: 0,
        totalFreelancers: 0,
        topSkills: [],
        rateDistribution: { entry: 0, intermediate: 0, expert: 0 },
        avgRating: 0,
        topRatedCount: 0
      }
    }

    const rates = services.map(s => s.hourlyRate)
    const avgRate = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    const minRate = Math.min(...rates)
    const maxRate = Math.max(...rates)

    // Count skills frequency
    const skillCounts: Record<string, number> = {}
    services.forEach(service => {
      service.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })

    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count, percentage: Math.round((count / services.length) * 100) }))

    // Rate distribution by experience level
    const rateDistribution = {
      entry: services.filter(s => s.hourlyRate < 40).length,
      intermediate: services.filter(s => s.hourlyRate >= 40 && s.hourlyRate < 70).length,
      expert: services.filter(s => s.hourlyRate >= 70).length
    }

    // Rating insights
    const avgRating = services.reduce((sum, s) => sum + s.rating, 0) / services.length
    const topRatedCount = services.filter(s => s.rating >= 4.5).length

    // Category distribution
    const categoryCounts: Record<string, number> = {}
    services.forEach(service => {
      categoryCounts[service.category] = (categoryCounts[service.category] || 0) + 1
    })

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ 
        category, 
        count, 
        percentage: Math.round((count / services.length) * 100) 
      }))

    return {
      avgRate,
      minRate,
      maxRate,
      totalFreelancers: services.length,
      topSkills,
      rateDistribution,
      avgRating: Math.round(avgRating * 10) / 10,
      topRatedCount,
      topCategories
    }
  }, [services])

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg">
      <CardContent className="p-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#15949C]/10 to-[#15949C]/5 dark:from-[#15949C]/20 dark:to-[#15949C]/10 p-4 rounded-xl border border-[#15949C]/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[#15949C]" />
              <span className="text-xs font-medium text-[#002333]/70 dark:text-gray-400">Avg Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#002333] dark:text-white">${insights.avgRate}</p>
            <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">/hour</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-[#002333]/70 dark:text-gray-400">Freelancers</span>
            </div>
            <p className="text-2xl font-bold text-[#002333] dark:text-white">{insights.totalFreelancers}</p>
            <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">available</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium text-[#002333]/70 dark:text-gray-400">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-[#002333] dark:text-white">{insights.avgRating}</p>
            <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">out of 5.0</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/20 dark:to-green-500/10 p-4 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-[#002333]/70 dark:text-gray-400">Top Rated</span>
            </div>
            <p className="text-2xl font-bold text-[#002333] dark:text-white">{insights.topRatedCount}</p>
            <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">4.5+ stars</p>
          </div>
        </div>

        <Tabs defaultValue="skills">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="skills" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300">Top Skills</TabsTrigger>
            <TabsTrigger value="rates" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300">Rate Distribution</TabsTrigger>
            <TabsTrigger value="categories" className="dark:data-[state=active]:bg-gray-600 dark:text-gray-300">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Entry Level */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002333] dark:text-white">Entry Level</h4>
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400">Under $40/hr</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#002333] dark:text-white">Freelancers</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{insights.rateDistribution.entry}</span>
                    </div>
                    <Progress value={(insights.rateDistribution.entry / insights.totalFreelancers) * 100} className="h-3" />
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">
                      {Math.round((insights.rateDistribution.entry / insights.totalFreelancers) * 100)}% of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Intermediate Level */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002333] dark:text-white">Intermediate</h4>
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400">$40-70/hr</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#002333] dark:text-white">Freelancers</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{insights.rateDistribution.intermediate}</span>
                    </div>
                    <Progress value={(insights.rateDistribution.intermediate / insights.totalFreelancers) * 100} className="h-3" />
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">
                      {Math.round((insights.rateDistribution.intermediate / insights.totalFreelancers) * 100)}% of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Expert Level */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#002333] dark:text-white">Expert</h4>
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400">$70+/hr</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#002333] dark:text-white">Freelancers</span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{insights.rateDistribution.expert}</span>
                    </div>
                    <Progress value={(insights.rateDistribution.expert / insights.totalFreelancers) * 100} className="h-3" />
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400 mt-1">
                      {Math.round((insights.rateDistribution.expert / insights.totalFreelancers) * 100)}% of total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            {insights.topSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {insights.topSkills.map((skill, index) => (
                  <div key={skill.skill} className="bg-white dark:bg-gray-700 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-600 hover:border-[#15949C] dark:hover:border-[#15949C] transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#15949C]/10 dark:bg-[#15949C]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#15949C]">#{index + 1}</span>
                      </div>
                      <Badge className="bg-[#15949C]/10 text-[#15949C] border-[#15949C]/20 text-xs">
                        {skill.percentage}%
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-base text-[#002333] dark:text-white mb-2">{skill.skill}</h4>
                    <Progress value={skill.percentage} className="h-2 mb-2" />
                    <p className="text-xs text-[#002333]/60 dark:text-gray-400">
                      {skill.count} freelancers
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-[#002333]/60 dark:text-gray-400">No skill data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            {insights.topCategories && insights.topCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.topCategories.map((cat, index) => {
                  const colors = [
                    { bg: 'from-[#15949C]/10 to-[#15949C]/5', border: 'border-[#15949C]/20', text: 'text-[#15949C]', iconBg: 'bg-[#15949C]' },
                    { bg: 'from-orange-500/10 to-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-600', iconBg: 'bg-orange-500' },
                    { bg: 'from-pink-500/10 to-pink-500/5', border: 'border-pink-500/20', text: 'text-pink-600', iconBg: 'bg-pink-500' }
                  ]
                  const color = colors[index] || colors[0]
                  
                  return (
                    <div key={cat.category} className={`bg-gradient-to-br ${color.bg} dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border-2 ${color.border} dark:border-gray-600`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full ${color.iconBg} flex items-center justify-center`}>
                          <span className="text-xl font-bold text-white">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-[#002333] dark:text-white capitalize">{cat.category}</h4>
                          <p className="text-xs text-[#002333]/60 dark:text-gray-400">{cat.count} services</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-[#002333] dark:text-white">Market Share</span>
                            <Badge className={`${color.bg} ${color.text} border-0 text-sm font-bold`}>
                              {cat.percentage}%
                            </Badge>
                          </div>
                          <Progress value={cat.percentage} className="h-3" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-[#002333]/60 dark:text-gray-400">No category data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

