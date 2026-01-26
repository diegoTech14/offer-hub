'use client';

import { useState } from 'react';
import { Users, Briefcase, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRoleStore } from '@/stores/use-role-store';
import { toast } from 'sonner';

export default function RolePage() {
  const { isFreelancer, isLoading, switchRole } = useRoleStore();
  const [showDialog, setShowDialog] = useState(false);
  const [targetRole, setTargetRole] = useState<'client' | 'freelancer'>('client');

  const handleRoleClick = (toFreelancer: boolean) => {
    if (isFreelancer === toFreelancer) return;
    setTargetRole(toFreelancer ? 'freelancer' : 'client');
    setShowDialog(true);
  };

  const handleConfirmSwitch = async () => {
    try {
      await switchRole(targetRole === 'freelancer');
      toast.success(`Successfully switched to ${targetRole} mode!`, {
        description: `You can now access ${targetRole} features`,
      });
      setShowDialog(false);
      
    //   setTimeout(() => {
    //     window.location.href = targetRole === 'freelancer' 
    //       ? '/freelancer/dashboard' 
    //       : '/client/dashboard';
    //   }, 500);
    } catch (error) {
      toast.error('Failed to switch role', {
        description: 'Please try again later',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Role Management
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Choose Your Role
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Switch seamlessly between client and freelancer modes to access different features and dashboards
          </p>
        </div>

        {/* Current Role Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground">Current role:</span>
          <Badge variant="default" className="gap-1.5 px-3 py-1">
            {isFreelancer ? (
              <>
                <Users className="h-3.5 w-3.5" />
                Freelancer
              </>
            ) : (
              <>
                <Briefcase className="h-3.5 w-3.5" />
                Client
              </>
            )}
          </Badge>
        </div>

        {/* Role Cards Grid */}
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 mb-8">
          {/* Client Card */}
          <Card 
            className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
              !isFreelancer 
                ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                : 'hover:scale-[1.02]'
            }`}
            onClick={() => handleRoleClick(false)}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              !isFreelancer ? 'opacity-100' : ''
            }`} />
            
            <CardHeader className="relative space-y-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Briefcase className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                {!isFreelancer && (
                  <Badge className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              
              <div>
                <CardTitle className="text-2xl mb-2">Client</CardTitle>
                <CardDescription className="text-base">
                  Post projects and hire talented freelancers
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Features included:</p>
                <ul className="space-y-2.5">
                  {[
                    'Post unlimited job opportunities',
                    'Review and compare proposals',
                    'Manage multiple projects',
                    'Secure payment processing',
                    'Real-time messaging',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full group/btn"
                size="lg"
                variant={!isFreelancer ? 'default' : 'outline'}
                disabled={!isFreelancer || isLoading}
              >
                {!isFreelancer ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Current Role
                  </>
                ) : (
                  <>
                    Switch to Client
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          <Card 
            className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
              isFreelancer 
                ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                : 'hover:scale-[1.02]'
            }`}
            onClick={() => handleRoleClick(true)}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isFreelancer ? 'opacity-100' : ''
            }`} />
            
            <CardHeader className="relative space-y-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-green-500/10 ring-1 ring-green-500/20">
                  <Users className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                {isFreelancer && (
                  <Badge className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              
              <div>
                <CardTitle className="text-2xl mb-2">Freelancer</CardTitle>
                <CardDescription className="text-base">
                  Find projects and grow your business
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Features included:</p>
                <ul className="space-y-2.5">
                  {[
                    'Browse curated job listings',
                    'Submit competitive proposals',
                    'Build your portfolio',
                    'Track your earnings',
                    'Get featured to clients',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className="w-full group/btn"
                size="lg"
                variant={isFreelancer ? 'default' : 'outline'}
                disabled={isFreelancer || isLoading}
              >
                {isFreelancer ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Current Role
                  </>
                ) : (
                  <>
                    Switch to Freelancer
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Switch anytime</h3>
                <p className="text-sm text-muted-foreground">
                  You can change your role whenever you need. Your data and settings will be preserved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
              {targetRole === 'freelancer' ? (
                <Users className="h-6 w-6 text-primary" />
              ) : (
                <Briefcase className="h-6 w-6 text-primary" />
              )}
            </div>
            <AlertDialogTitle className="text-center">
              Switch to {targetRole} mode?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {targetRole === 'freelancer' 
                ? 'You\'ll be redirected to the freelancer dashboard where you can browse jobs and submit proposals.'
                : 'You\'ll be redirected to the client dashboard where you can post jobs and review proposals.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch} disabled={isLoading}>
              {isLoading ? 'Switching...' : `Switch to ${targetRole}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}