"use client"

import { useState } from "react"
import { VALIDATION_LIMITS } from "@/constants/magic-numbers"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Heart, MessageSquare, Check, MapPin, Clock, Briefcase } from "lucide-react"
import ServiceRequestModal from "@/components/modals/service-request-modal"

interface TalentCardProps {
  freelancer: any
  isSelected: boolean
  onToggleSelect: () => void
  onViewProfile: () => void
  onContact?: () => void
  layout?: "grid" | "list"
}

export default function TalentCard({
  freelancer,
  isSelected,
  onToggleSelect,
  onViewProfile,
  onContact,
  layout = "grid",
}: TalentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const handleContact = () => {
    if (onContact) {
      onContact()
    } else {
      setIsContactModalOpen(true)
    }
  }

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        />
      ))
  }

  if (layout === "list") {
    return (
      <>
      <Card
        className={`overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/20 ${isSelected ? "ring-2 ring-[#15949C]" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row h-auto md:h-40">
            <div className="relative w-full md:w-40 h-40 bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] flex items-center justify-center flex-shrink-0">
              <Avatar className="h-20 w-20 border-3 border-white dark:border-gray-700 shadow-lg">
                <AvatarImage 
                  src={freelancer.avatar} 
                  alt={freelancer.name}
                  className="object-cover"
                  progressive={false}
                />
                <AvatarFallback className="bg-white dark:bg-gray-600 text-[#15949C] dark:text-white text-2xl font-semibold">
                  {freelancer.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {freelancer.isOnline && (
                <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`absolute top-4 left-4 h-8 w-8 rounded-full ${isSelected ? "bg-[#15949C] text-white" : "bg-white/80 text-[#002333]"}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect()
                }}
              >
                {isSelected ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#002333] dark:text-white">{freelancer.name}</h3>
                    {freelancer.isVerified && <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0">Verified</Badge>}
                    {freelancer.isTopRated && <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0">Top Rated</Badge>}
                  </div>

                  <p className="text-[#002333]/70 dark:text-gray-300 text-sm mt-0.5">{freelancer.title}</p>

                  <div className="flex items-center mt-1">
                    <div className="flex mr-1.5">{renderStars(freelancer.rating)}</div>
                    <span className="text-[#002333] dark:text-white font-medium text-sm">{freelancer.rating.toFixed(1)}</span>
                    <span className="text-[#002333]/70 dark:text-gray-400 ml-1 text-xs">({freelancer.reviewCount})</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[#002333] dark:text-white font-bold text-base">${freelancer.hourlyRate}/hr</div>
                  <div className="text-[#002333]/70 dark:text-gray-400 text-xs">
                    {freelancer.totalEarned ? `$${freelancer.totalEarned}+ earned` : "New"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {freelancer.skills.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="dark:border-gray-600 dark:text-gray-300 text-xs px-1.5 py-0">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 3 && <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300 text-xs px-1.5 py-0">+{freelancer.skills.length - 3}</Badge>}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#002333]/70 dark:text-gray-400 flex-shrink-0 ml-2">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{freelancer.location.split(',')[0]}</span>
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                <Button className="flex-1 bg-[#15949C] hover:bg-[#117a81] text-white h-8 text-xs" onClick={onViewProfile}>
                  View Profile
                </Button>
                <Button 
                  className="flex-1 bg-[#002333] hover:bg-[#003d4d] text-white h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleContact()
                  }}
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Request Modal */}
      <ServiceRequestModal
        open={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        serviceId={freelancer.id}
      />
    </>
    )
  }

  return (
    <>
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/20 h-full flex flex-col group ${isSelected ? "ring-2 ring-[#15949C] shadow-lg" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Header Section with Gradient */}
        <div className="relative h-32 bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] flex items-center justify-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <Avatar className="h-16 w-16 border-3 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <AvatarImage 
              src={freelancer.avatar} 
              alt={freelancer.name} 
              className="object-cover"
              progressive={false}
            />
            <AvatarFallback className="bg-white dark:bg-gray-600 text-[#15949C] dark:text-white text-lg font-semibold">
              {freelancer.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          
          {freelancer.isOnline && (
            <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white animate-pulse"></div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 left-3 h-8 w-8 rounded-full transition-all duration-200 ${
              isSelected 
                ? "bg-white text-[#15949C] shadow-lg" 
                : "bg-white/80 text-[#002333] hover:bg-white hover:shadow-md"
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect()
            }}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
          </Button>
          
          {/* Top Rated Badge */}
          {freelancer.isTopRated && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-md">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4 bg-white dark:bg-gray-800">
          {/* Name and Badges */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-base text-[#002333] dark:text-white truncate">{freelancer.name}</h3>
              {freelancer.isVerified && (
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <p className="text-[#002333]/70 dark:text-gray-300 text-xs truncate">{freelancer.title}</p>
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="flex mr-1">{renderStars(freelancer.rating)}</div>
              <span className="text-[#002333] dark:text-white font-semibold text-xs">{freelancer.rating.toFixed(1)}</span>
              <span className="text-[#002333]/60 dark:text-gray-400 ml-1 text-xs">({freelancer.reviewCount})</span>
            </div>
            <div className="text-right">
              <div className="text-[#15949C] font-bold text-sm">${freelancer.hourlyRate}/hr</div>
              <div className="text-xs text-[#002333]/60 dark:text-gray-400">Starting at</div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {freelancer.skills.slice(0, 2).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs px-1.5 py-0.5 bg-[#15949C]/5 border-[#15949C]/20 text-[#15949C] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                  {skill}
                </Badge>
              ))}
              {freelancer.skills.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  +{freelancer.skills.length - 2}
                </Badge>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-xs text-[#002333]/70 dark:text-gray-400 mb-3">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-[#15949C]" />
            <span className="truncate">{freelancer.location}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-1.5">
            <Button 
              className="flex-1 bg-gradient-to-r from-[#15949C] to-[#117a81] hover:from-[#117a81] hover:to-[#0d5f65] text-white font-medium py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2"
              onClick={onViewProfile}
            >
              <Briefcase className="h-3 w-3 mr-0.5" />
              View
            </Button>
            <Button 
              className="flex-1 bg-[#002333] hover:bg-[#003d4d] text-white font-medium py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-xs px-2"
              onClick={(e) => {
                e.stopPropagation()
                handleContact()
              }}
            >
              <MessageSquare className="h-3 w-3 mr-0.5" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Service Request Modal */}
    <ServiceRequestModal
      open={isContactModalOpen}
      onClose={() => setIsContactModalOpen(false)}
      serviceId={freelancer.id}
    />
    </>
  )
}

