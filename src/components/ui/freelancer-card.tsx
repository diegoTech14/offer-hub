
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, MapPin, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import ServiceRequestModal from "@/components/modals/service-request-modal";
import type { Freelancer } from "@/data/landing-data";
import { Badge } from "@/components/ui/badge";

export default function FreelancerCard({
  id,
  name,
  title,
  avatar,
  rating,
  reviews,
  hourlyRate,
  verified,
  serviceId,
}: Freelancer & { serviceId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleHireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <div className="group relative">
      <Link 
        href={`/talent/${id}/profile`}
        className="
          block bg-white dark:bg-gray-800 
          rounded-xl border border-gray-200 dark:border-gray-700 
          overflow-hidden 
          hover:shadow-2xl dark:hover:shadow-gray-900/40
          hover:border-[#15949C] dark:hover:border-[#15949C]
          transition-all duration-300
          hover:-translate-y-2
          cursor-pointer
          relative
        "
      >
        {/* Badge de Top Rated */}
        {rating >= 4.5 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Top Rated
            </Badge>
          </div>
        )}

        {/* Header con gradiente */}
        <div className="h-36 bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] relative">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </div>
        
        {/* Avatar (fuera del header para evitar corte) */}
        <div className="absolute top-24 left-6 z-20">
          <div className="relative">
            <div className="
              rounded-full border-4 border-white dark:border-gray-800 
              overflow-hidden h-24 w-24
              ring-4 ring-transparent group-hover:ring-[#15949C]/40
              transition-all duration-300
              shadow-xl
              bg-white dark:bg-gray-800
            ">
              <Image
                src={avatar || "/placeholder.svg"}
                alt={name}
                width={96}
                height={96}
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            {/* Verificación badge */}
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                <CheckCircle className="h-5 w-5 text-[#15949C] fill-[#15949C]" />
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="pt-16 pb-6 px-6">
          {/* Nombre y título */}
          <div className="mb-4">
            <h3 className="
              text-xl font-bold 
              text-[#002333] dark:text-white
              group-hover:text-[#15949C] dark:group-hover:text-[#15949C]
              transition-colors duration-300
              mb-1
            ">
              {name}
            </h3>
            <p className="text-sm text-[#002333]/70 dark:text-gray-400 font-medium flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {title}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <StarRating rating={rating} />
              <span className="text-sm font-semibold text-[#002333] dark:text-white ml-1">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-[#002333]/60 dark:text-gray-500">
              ({reviews} reviews)
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#002333]/60 dark:text-gray-500 mb-1">Starting at</p>
              <p className="text-2xl font-bold text-[#002333] dark:text-white">
                ${hourlyRate}
                <span className="text-sm font-normal text-[#002333]/60 dark:text-gray-500">/hr</span>
              </p>
            </div>
            
            <Button
              size="default"
              className="
                bg-gradient-to-r from-[#15949C] to-[#117a81]
                hover:from-[#117a81] hover:to-[#0d5f65]
                text-white font-semibold
                shadow-lg hover:shadow-xl
                transition-all duration-200
                hover:scale-105
                relative z-10
                px-6
                rounded-lg
              "
              onClick={handleHireClick}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Hire Me
            </Button>
          </div>
        </div>
      </Link>
      
      <ServiceRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceId={serviceId}
      />
    </div>
  );
}
