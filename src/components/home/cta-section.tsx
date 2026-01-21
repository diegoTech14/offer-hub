"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, UserPlus, ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#002333] via-[#003d4d] to-[#15949C] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Start Your Journey Today</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to get started?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto mb-10 leading-relaxed">
            Join thousands of clients and freelancers already using Offer Hub to
            connect, collaborate, and create amazing projects worldwide
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/find-workers" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="
                w-full sm:w-auto
                group
                bg-white text-[#002333] 
                hover:bg-gray-50
                font-semibold text-lg
                px-8 py-6
                rounded-xl
                shadow-2xl hover:shadow-3xl
                transition-all duration-300
                hover:scale-105
                flex items-center justify-center gap-3
              "
            >
              <Briefcase className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Find Talent
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link href="/profile" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="
                w-full sm:w-auto
                group
                bg-transparent
                border-2 border-white
                text-white
                hover:bg-white hover:text-[#002333]
                font-semibold text-lg
                px-8 py-6
                rounded-xl
                shadow-2xl hover:shadow-3xl
                transition-all duration-300
                hover:scale-105
                flex items-center justify-center gap-3
              "
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Become a Freelancer
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
