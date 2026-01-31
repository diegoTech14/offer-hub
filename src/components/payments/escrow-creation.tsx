"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Shield,
  Clock,
  DollarSign,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Building,
  CreditCard,
} from 'lucide-react';

import { useEscrowManagement } from '@/hooks/use-escrow-management';
import { escrowSecurityUtils } from '@/utils/escrow-security';
import {
  EscrowCreationRequest,
  EscrowContract,
  EscrowType,
  SecuritySettings,
  ComplianceSettings,
  AutoReleaseSettings,
  MilestoneCreationRequest,
  ValidationResult,
} from '@/types/escrow.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EscrowCreationProps {
  onClose: () => void;
  onSuccess: (escrow: EscrowContract) => void;
  initialData?: Partial<EscrowCreationRequest>;
}

export default function EscrowCreation({ onClose, onSuccess, initialData }: EscrowCreationProps) {
  const { createEscrow, calculateEscrowFees, validateEscrowCreation, creating, creationError } = useEscrowManagement();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EscrowCreationRequest>({
    clientId: initialData?.clientId || '',
    freelancerId: initialData?.freelancerId || '',
    projectId: initialData?.projectId || '',
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'USD',
    description: initialData?.description || '',
    milestones: initialData?.milestones || [],
    escrowType: initialData?.escrowType || 'milestone',
    securitySettings: initialData?.securitySettings || {
      multiSigRequired: false,
      timeLockDuration: 24,
      maxDisputeWindow: 168, // 7 days
      requireKYC: false,
      requireInsurance: false,
      encryptionLevel: 'standard',
      accessControls: [],
    },
    autoReleaseSettings: initialData?.autoReleaseSettings || {
      enabled: false,
      trigger: 'manual',
      conditions: [],
      fallbackAction: 'hold',
      notificationSettings: {
        email: true,
        sms: false,
        push: true,
        recipients: [],
      },
    },
    complianceSettings: initialData?.complianceSettings || {
      jurisdiction: '',
      regulatoryRequirements: [],
      taxHandling: 'platform',
      reportingRequirements: [],
      auditLevel: 'basic',
    },
    terms: initialData?.terms || '',
    attachments: initialData?.attachments || [],
  });

  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Calculate fees
  const fees = calculateEscrowFees(formData.amount, formData.escrowType);
  const totalAmount = formData.amount + fees;

  // Validate form data
  useEffect(() => {
    const validateForm = async () => {
      setIsValidating(true);
      try {
        const results = validateEscrowCreation(formData);
        setValidationResults(results);
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setIsValidating(false);
      }
    };

    validateForm();
  }, [formData, validateEscrowCreation]);

  const handleInputChange = (field: keyof EscrowCreationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneCreationRequest, value: any) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      milestones: updatedMilestones,
    }));
  };

  const addMilestone = () => {
    const newMilestone: MilestoneCreationRequest = {
      title: '',
      description: '',
      amount: 0,
      dueDate: '',
      completionCriteria: [],
      deliverables: [],
      autoReleaseAfter: undefined,
      requiresApproval: true,
    };

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      const escrow = await createEscrow(formData);
      onSuccess(escrow);
    } catch (err) {
      console.error('Failed to create escrow:', err);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.clientId && formData.freelancerId && formData.amount > 0 && formData.description;
      case 2:
        return formData.milestones.length > 0 && formData.milestones.every(m => m.title && m.amount > 0);
      case 3:
        return formData.escrowType && formData.securitySettings;
      case 4:
        return formData.terms && validationResults.filter(r => r.status === 'fail').length === 0;
      default:
        return false;
    }
  };

  const getValidationStatus = () => {
    const failedChecks = validationResults.filter(r => r.status === 'fail');
    const warnings = validationResults.filter(r => r.status === 'warning');
    
    if (failedChecks.length > 0) {
      return { status: 'error', message: `${failedChecks.length} validation errors` };
    }
    if (warnings.length > 0) {
      return { status: 'warning', message: `${warnings.length} warnings` };
    }
    return { status: 'success', message: 'All validations passed' };
  };

  const validationStatus = getValidationStatus();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#15949C]" />
            Create New Escrow
          </DialogTitle>
          <DialogDescription>
            Set up a secure escrow contract for your project. Complete all steps to create your escrow.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#002333]/70">Step {currentStep} of {totalSteps}</span>
            <span className="font-medium text-[#002333]">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Alert */}
        {creationError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Creation Failed</AlertTitle>
            <AlertDescription className="text-red-700">{creationError}</AlertDescription>
          </Alert>
        )}

        {/* Validation Status */}
        {validationResults.length > 0 && (
          <Alert className={
            validationStatus.status === 'error' ? 'bg-red-50 border-red-200' :
            validationStatus.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }>
            {validationStatus.status === 'error' ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : validationStatus.status === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle className={
              validationStatus.status === 'error' ? 'text-red-800' :
              validationStatus.status === 'warning' ? 'text-yellow-800' :
              'text-green-800'
            }>
              {validationStatus.message}
            </AlertTitle>
            <AlertDescription className={
              validationStatus.status === 'error' ? 'text-red-700' :
              validationStatus.status === 'warning' ? 'text-yellow-700' :
              'text-green-700'
            }>
              {validationResults.map((result, index) => (
                <div key={index} className="text-sm">
                  • {result.message}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Form Steps */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#15949C]" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the essential details for your escrow contract
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client ID *</Label>
                      <Input
                        id="clientId"
                        value={formData.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        placeholder="Enter client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freelancerId">Freelancer ID *</Label>
                      <Input
                        id="freelancerId"
                        value={formData.freelancerId}
                        onChange={(e) => handleInputChange('freelancerId', e.target.value)}
                        placeholder="Enter freelancer ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project ID</Label>
                    <Input
                      id="projectId"
                      value={formData.projectId}
                      onChange={(e) => handleInputChange('projectId', e.target.value)}
                      placeholder="Enter project ID (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="amount"
                          type="number"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the project and escrow purpose..."
                      rows={4}
                    />
                  </div>

                  {/* Fee Calculation */}
                  <Card className="bg-[#DEEFE7]/30 border-[#15949C]/20">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#002333]/70">Escrow Amount:</span>
                          <span className="font-medium text-[#002333]">
                            ${formData.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#002333]/70">Platform Fee ({formData.escrowType}):</span>
                          <span className="font-medium text-[#002333]">
                            ${fees.toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#002333]">Total Amount:</span>
                          <span className="text-lg font-bold text-[#15949C]">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Milestones */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#15949C]" />
                        Project Milestones
                      </CardTitle>
                      <CardDescription>
                        Define the milestones and payment schedule for your project
                      </CardDescription>
                    </div>
                    <Button onClick={addMilestone} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.milestones.map((milestone, index) => (
                    <Card key={index} className="border-[#15949C]/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Milestone {index + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                              placeholder="Milestone title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Amount *</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                value={milestone.amount}
                                onChange={(e) => handleMilestoneChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={milestone.description}
                            onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                            placeholder="Describe what needs to be completed..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Auto-release After (hours)</Label>
                            <Input
                              type="number"
                              value={milestone.autoReleaseAfter || ''}
                              onChange={(e) => handleMilestoneChange(index, 'autoReleaseAfter', parseFloat(e.target.value) || undefined)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`requiresApproval-${index}`}
                            checked={milestone.requiresApproval}
                            onCheckedChange={(checked) => handleMilestoneChange(index, 'requiresApproval', checked)}
                          />
                          <Label htmlFor={`requiresApproval-${index}`}>
                            Requires client approval before release
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {formData.milestones.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#002333] mb-2">No Milestones Added</h3>
                      <p className="text-[#002333]/70 mb-4">
                        Add milestones to define the project structure and payment schedule.
                      </p>
                      <Button onClick={addMilestone}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Milestone
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Security & Settings */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#15949C]" />
                    Security & Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security settings and escrow type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="escrowType">Escrow Type *</Label>
                    <Select value={formData.escrowType} onValueChange={(value) => handleInputChange('escrowType', value as EscrowType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milestone">Milestone-based</SelectItem>
                        <SelectItem value="time_based">Time-based</SelectItem>
                        <SelectItem value="deliverable">Deliverable-based</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Security Settings</Label>
                        <p className="text-sm text-[#002333]/70">Configure security and access controls</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                      >
                        {showAdvancedSettings ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multiSigRequired"
                          checked={formData.securitySettings.multiSigRequired}
                          onCheckedChange={(checked) => handleInputChange('securitySettings', {
                            ...formData.securitySettings,
                            multiSigRequired: checked,
                          })}
                        />
                        <Label htmlFor="multiSigRequired">Multi-signature required</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireKYC"
                          checked={formData.securitySettings.requireKYC}
                          onCheckedChange={(checked) => handleInputChange('securitySettings', {
                            ...formData.securitySettings,
                            requireKYC: checked,
                          })}
                        />
                        <Label htmlFor="requireKYC">Require KYC verification</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requireInsurance"
                          checked={formData.securitySettings.requireInsurance}
                          onCheckedChange={(checked) => handleInputChange('securitySettings', {
                            ...formData.securitySettings,
                            requireInsurance: checked,
                          })}
                        />
                        <Label htmlFor="requireInsurance">Require insurance</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="encryptionLevel">Encryption Level</Label>
                        <Select
                          value={formData.securitySettings.encryptionLevel}
                          onValueChange={(value) => handleInputChange('securitySettings', {
                            ...formData.securitySettings,
                            encryptionLevel: value as 'standard' | 'enhanced' | 'military',
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                            <SelectItem value="military">Military Grade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {showAdvancedSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="timeLockDuration">Time Lock Duration (hours)</Label>
                            <Input
                              id="timeLockDuration"
                              type="number"
                              value={formData.securitySettings.timeLockDuration || ''}
                              onChange={(e) => handleInputChange('securitySettings', {
                                ...formData.securitySettings,
                                timeLockDuration: parseFloat(e.target.value) || undefined,
                              })}
                              placeholder="24"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="maxDisputeWindow">Max Dispute Window (hours)</Label>
                            <Input
                              id="maxDisputeWindow"
                              type="number"
                              value={formData.securitySettings.maxDisputeWindow}
                              onChange={(e) => handleInputChange('securitySettings', {
                                ...formData.securitySettings,
                                maxDisputeWindow: parseFloat(e.target.value) || 168,
                              })}
                              placeholder="168"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Auto-Release Settings</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoReleaseEnabled"
                        checked={formData.autoReleaseSettings?.enabled || false}
                        onCheckedChange={(checked) => handleInputChange('autoReleaseSettings', {
                          ...formData.autoReleaseSettings,
                          enabled: checked,
                        })}
                      />
                      <Label htmlFor="autoReleaseEnabled">Enable automatic fund release</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Terms & Review */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#15949C]" />
                    Terms & Review
                  </CardTitle>
                  <CardDescription>
                    Review your escrow configuration and add terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions *</Label>
                    <Textarea
                      id="terms"
                      value={formData.terms}
                      onChange={(e) => handleInputChange('terms', e.target.value)}
                      placeholder="Enter the terms and conditions for this escrow contract..."
                      rows={6}
                    />
                  </div>

                  {/* Review Summary */}
                  <Card className="bg-[#DEEFE7]/30 border-[#15949C]/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Escrow Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-[#002333]/70">Client ID:</span>
                          <p className="font-medium text-[#002333]">{formData.clientId}</p>
                        </div>
                        <div>
                          <span className="text-sm text-[#002333]/70">Freelancer ID:</span>
                          <p className="font-medium text-[#002333]">{formData.freelancerId}</p>
                        </div>
                        <div>
                          <span className="text-sm text-[#002333]/70">Total Amount:</span>
                          <p className="font-medium text-[#002333]">${totalAmount.toFixed(2)} {formData.currency}</p>
                        </div>
                        <div>
                          <span className="text-sm text-[#002333]/70">Escrow Type:</span>
                          <Badge variant="outline" className="text-[#15949C] border-[#15949C]">
                            {formData.escrowType}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-[#002333]/70">Milestones:</span>
                          <p className="font-medium text-[#002333]">{formData.milestones.length}</p>
                        </div>
                        <div>
                          <span className="text-sm text-[#002333]/70">Security Level:</span>
                          <Badge variant="outline" className="text-[#15949C] border-[#15949C]">
                            {formData.securitySettings.encryptionLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || creating || isValidating}
                className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Escrow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
