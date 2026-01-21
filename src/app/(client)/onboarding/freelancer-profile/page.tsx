"use client"

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import Footer from "@/components/freelancer-profile/footer"
import StepsController from "@/components/freelancer-profile/steps"
import { Button } from "@/components/ui/button"
import { useFreelancerOnboarding } from "@/hooks/use-freelancer-steps"
import { ArrowLeft } from "lucide-react"

export default function FreelancerProfilePage() {
  const { currentStep, userData, nextStep, prevStep, updateUserData } = useFreelancerOnboarding()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showAuth={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64">
          <ClientSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <StepsController
                currentStep={currentStep}
                userData={userData}
                nextStep={nextStep}
                prevStep={prevStep}
                updateUserData={updateUserData}
              />

              <div>
                <Footer>
                  <div className="mx-auto max-w-4xl flex justify-between items-center">
                    <div>
                      <Button variant="ghost" className="gap-1 rounded-full">
                        <ArrowLeft size={18} /> Back
                      </Button>
                    </div>

                    <div className="space-x-4">
                      <Button
                        variant="outline"
                        className="border-[#149A9B] text-[#149A9B] hover:text-[#149A9B]
                          bg-transparent rounded-full md:min-w-36"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="add-work-experience-form"
                        className="gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36"
                      >
                        Add Education
                      </Button>
                    </div>
                  </div>
                </Footer>
              </div> 
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
