/**
 * Application Form Component
 * Main component integrating all application features
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useApplicationForm } from '@/hooks/use-application-form';
import {
  ApplicationFormData,
  ProposalTemplate,
  ProposalContent,
  BudgetProposal,
  Timeline,
  AvailabilityInfo,
  ClientQuestion,
} from '@/types/application-form.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ProposalTemplates } from './proposal-templates';
import { ProposalEditor } from './proposal-editor';
import { BudgetProposal as BudgetProposalComponent } from './budget-proposal';
import { TimelinePlanner } from './timeline-planner';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Clock,
  FileText,
  DollarSign,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationFormProps {
  projectId: string;
  freelancerId: string;
  projectTitle?: string;
  projectDescription?: string;
  clientQuestions?: ClientQuestion[];
  onSubmit?: (data: ApplicationFormData) => Promise<void>;
  onSave?: (data: Partial<ApplicationFormData>) => Promise<void>;
  initialData?: Partial<ApplicationFormData>;
  className?: string;
}

type FormStep = 'template' | 'proposal' | 'budget' | 'timeline' | 'details' | 'review';

const FORM_STEPS: { id: FormStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'proposal', label: 'Proposal', icon: FileText },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: CalendarDays },
  { id: 'details', label: 'Details', icon: User },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
];

export function ApplicationForm({
  projectId,
  freelancerId,
  projectTitle,
  clientQuestions = [],
  onSubmit,
  onSave,
  initialData,
  className = '',
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate>(
    (initialData?.templateType as ProposalTemplate) || 'standard'
  );

  const {
    formData,
    isDirty,
    isSubmitting,
    isSaving,
    validation,
    lastSaved,
    updateFormData,
    saveAsDraft,
    submitApplication,
  } = useApplicationForm({
    projectId,
    freelancerId,
    enableAutoSave: true,
    onSubmit,
    onSave,
    initialData,
  });

  const currentStepIndex = FORM_STEPS.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / FORM_STEPS.length) * 100;

  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < FORM_STEPS.length) {
      setCurrentStep(FORM_STEPS[nextIndex].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(FORM_STEPS[prevIndex].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const handleTemplateSelect = useCallback(
    (template: ProposalTemplate) => {
      setSelectedTemplate(template);
      updateFormData('templateType', template);
    },
    [updateFormData]
  );


  const handleCoverLetterChange = useCallback(
    (coverLetter: string) => {
      updateFormData('coverLetter', coverLetter);
    },
    [updateFormData]
  );

  const handleBudgetChange = useCallback(
    (budget: BudgetProposal) => {
      updateFormData('budget', budget);
    },
    [updateFormData]
  );

  const handleBudgetCalculate = useCallback(
    (calculation: unknown) => {
      // You can use the calculation here if needed
      console.log('Budget calculated:', calculation);
    },
    []
  );

  const handleTimelineChange = useCallback(
    (timeline: Timeline) => {
      updateFormData('timeline', timeline);
    },
    [updateFormData]
  );


  const handleAvailabilityChange = useCallback(
    (availability: AvailabilityInfo) => {
      updateFormData('availability', availability);
    },
    [updateFormData]
  );

  const handleSubmit = useCallback(async () => {
    const result = await submitApplication();
    
    if (result.success) {
      // Handle successful submission (e.g., show success message, redirect)
      console.log('Application submitted successfully!');
    } else {
      // Handle errors
      console.error('Submission failed:', result.errors || result.error);
    }
  }, [submitApplication]);

  const getStepStatus = (stepId: FormStep) => {
    if (stepId === currentStep) return 'current';
    const stepIndex = FORM_STEPS.findIndex((s) => s.id === stepId);
    if (stepIndex < currentStepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className={cn('space-y-6 p-4 lg:p-6 hover:scale-100 hover:shadow-none border-none ', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Submit Your Application</h1>
            {projectTitle && (
              <p className="text-lg text-muted-foreground">For: {projectTitle}</p>
            )}
          </div>
          <div className="lg:text-right flex lg:flex-col items-center text-left space-y-1">
            <Badge variant={formData.status === 'draft' ? 'secondary' : 'default'}>
              {formData.status}
            </Badge>
            {lastSaved && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {FORM_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap',
                    status === 'current' &&
                      'bg-primary text-primary-foreground ',
                    status === 'completed' &&
                      'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20',
                    status === 'upcoming' &&
                      'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                  {status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                  )}
                </button>
                {index < FORM_STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && currentStep === 'review' && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Please fix the following errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      <Card className="min-h-[600px]  hover:shadow-sm hover:scale-100">
        <CardContent className="pt-6 hover:scale-100">
          {currentStep === 'template' && (
            <ProposalTemplates
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleTemplateSelect}
            />
          )}

          {currentStep === 'proposal' && (
            <ProposalEditor
              templateType={selectedTemplate}
              coverLetter={formData.coverLetter || ''}
              onCoverLetterChange={handleCoverLetterChange}
            />
          )}

          {currentStep === 'budget' && (
            <BudgetProposalComponent
              budget={formData.budget || {}}
              onChange={handleBudgetChange}
              onCalculate={handleBudgetCalculate}
            />
          )}

          {currentStep === 'timeline' && (
            <TimelinePlanner
              timeline={formData.timeline || {}}
              milestones={formData.budget?.milestones || []}
              onChange={handleTimelineChange}
            />
          )}

          {currentStep === 'details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Additional Details</h2>
                <p className="text-muted-foreground">
                  Provide information about your availability and relevant experience
                </p>
              </div>

              <Card className='hover:scale-100 hover:shadow-none border'>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>
                    When can you start and how much time can you commit?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                      <Input
                        id="hoursPerWeek"
                        type="number"
                        value={formData.availability?.hoursPerWeek || ''}
                        onChange={(e) =>
                          handleAvailabilityChange({
                            ...(formData.availability || {
                              startDate: new Date(),
                              timezone: 'UTC',
                              flexibleHours: false,
                              commitmentLevel: 'part-time',
                            }),
                            hoursPerWeek: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="40"
                        min="1"
                        max="168"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={formData.availability?.timezone || ''}
                        onChange={(e) =>
                          handleAvailabilityChange({
                            ...(formData.availability || {
                              hoursPerWeek: 40,
                              startDate: new Date(),
                              flexibleHours: false,
                              commitmentLevel: 'part-time',
                            }),
                            timezone: e.target.value,
                          })
                        }
                        placeholder="UTC, EST, PST, etc."
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="flexibleHours"
                      checked={formData.availability?.flexibleHours || false}
                      onCheckedChange={(checked) =>
                        handleAvailabilityChange({
                          ...(formData.availability || {
                            hoursPerWeek: 40,
                            startDate: new Date(),
                            timezone: 'UTC',
                            commitmentLevel: 'part-time',
                          }),
                          flexibleHours: checked,
                        })
                      }
                    />
                    <Label htmlFor="flexibleHours">I have flexible working hours</Label>
                  </div>
                </CardContent>
              </Card>

              {clientQuestions.length > 0 && (
                <Card className='hover:scale-100 hover:shadow-none border'>
                  <CardHeader>
                    <CardTitle>Client Questions</CardTitle>
                    <CardDescription>
                      The client has asked some specific questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {clientQuestions.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <Label htmlFor={`question-${index}`}>
                          {question.question}
                          {question.isRequired && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Textarea
                          id={`question-${index}`}
                          value={
                            formData.clientQuestions?.find((q) => q.id === question.id)
                              ?.answer || ''
                          }
                          onChange={(e) => {
                            const questions = [...(formData.clientQuestions || clientQuestions)];
                            const questionIndex = questions.findIndex(
                              (q) => q.id === question.id
                            );
                            if (questionIndex >= 0) {
                              questions[questionIndex] = {
                                ...questions[questionIndex],
                                answer: e.target.value,
                              };
                            } else {
                              questions.push({
                                ...question,
                                answer: e.target.value,
                              });
                            }
                            updateFormData('clientQuestions', questions);
                          }}
                          placeholder="Your answer..."
                          className="min-h-[100px]"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className='hover:scale-100 hover:shadow-none border'>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <Switch
                      id="terms"
                      checked={formData.termsAccepted || false}
                      onCheckedChange={(checked) =>
                        updateFormData('termsAccepted', checked)
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="terms" className="cursor-pointer">
                        I accept the terms and conditions
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        By submitting this application, you agree to our terms of service and
                        privacy policy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Review Your Application</h2>
                <p className="text-muted-foreground">
                  Review all details before submitting your application
                </p>
              </div>

              <div className="space-y-4">
                <Card className='hover:scale-100 hover:shadow-none border'>
                  <CardHeader>
                    <CardTitle className="text-lg">Template & Proposal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <Badge>{selectedTemplate}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cover Letter:</span>
                      <span>{formData.coverLetter?.length || 0} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deliverables:</span>
                      <span>{formData.proposal?.deliverables?.length || 0} items</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className='hover:scale-100 hover:shadow-none border'>
                  <CardHeader>
                    <CardTitle className="text-lg">Budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pricing Model:</span>
                      <Badge>{formData.budget?.pricingModel || 'Not set'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span>{formData.budget?.currency || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>
                        {formData.budget?.currency === 'USD' ? '$' : ''}
                        {formData.budget?.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className='hover:scale-100 hover:shadow-none border'>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>
                        {formData.timeline?.startDate
                          ? new Date(formData.timeline.startDate).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formData.timeline?.totalDuration || 0} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Events:</span>
                      <span>{formData.timeline?.events?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className='hover:scale-100 hover:shadow-none border'>
                  <CardHeader>
                    <CardTitle className="text-lg">Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours per Week:</span>
                      <span>{formData.availability?.hoursPerWeek || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timezone:</span>
                      <span>{formData.availability?.timezone || 'Not set'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {currentStepIndex > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={saveAsDraft}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>

          {currentStepIndex < FORM_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.termsAccepted}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

