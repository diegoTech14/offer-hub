"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Briefcase, MapPin, Link as LinkIcon } from "lucide-react";
import { VerificationCard } from "@/components/dashboard/verification-card";
import { useUserVerification } from "@/hooks/use-user-verification";

export default function ProfilePage() {
  const { verificationStatus, loading: verificationLoading } = useUserVerification();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showAuth={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64">
          <ClientSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your personal information</p>
            </div>

            {/* Verification Status Card */}
            {!verificationLoading && verificationStatus && (
              <VerificationCard
                level={verificationStatus.verification_level}
                verifiedAt={verificationStatus.verified_at}
                transactionHash={verificationStatus.verification_metadata?.transactionHash}
                variant="detailed"
              />
            )}

            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#149A9B] to-[#0D6B6C] flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">J</span>
                </div>
                <div className="flex-1">
                  <Button variant="outline" size="sm">
                    Upload Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF (max. 2MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Josué Araya" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="Josue19_08" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input id="email" type="email" defaultValue="josuemarin2009@hotmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    defaultValue="Developer" 
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" placeholder="e.g. Full Stack Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  <Input id="location" placeholder="City, Country" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Website
                  </Label>
                  <Input id="website" type="url" placeholder="https://yourwebsite.com" />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1 bg-[#149A9B] hover:bg-[#128889] text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


