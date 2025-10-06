import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FreelancerCard from "@/components/ui/freelancer-card";
import { freelancers } from "@/data/landing-data";

export default function FreelancersSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#002333] dark:text-white mb-2">
              Top Rated Freelancers
            </h2>
            <p className="text-[#002333]/70 dark:text-gray-300">
              Discover our most successful professionals
            </p>
          </div>
          <Button
            className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {freelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} {...freelancer} serviceId="2d74caed-07cc-4914-bb3c-78dbef3d4657" />
          ))}
        </div>
      </div>
    </section>
  );
}
