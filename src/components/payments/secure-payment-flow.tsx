/**
 * Example Integration: Payment Security in Transaction Flow
 * This file demonstrates how to integrate the payment security system
 * into a real payment processing workflow
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Lock
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { usePaymentSecurity } from '@/hooks/use-payment-security';
import {
  RiskAssessment as RiskAssessmentType,
  FraudDetectionResult,
  RiskLevel,
  SecurityActionType,
  SecurityEventType,
  SecuritySeverity
} from '@/types/payment-security.types';
import {
  generateSecureTransactionId,
  generateDeviceFingerprint,
  assessTransactionRisk
} from '@/utils/security-helpers';

interface SecurePaymentFlowProps {
  onPaymentComplete?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export function SecurePaymentFlow({
  onPaymentComplete,
  onPaymentError
}: SecurePaymentFlowProps) {
  const {
    isLoading,
    error,
    assessRisk,
    detectFraud,
    reportSecurityEvent
  } = usePaymentSecurity();

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  // Security state
  const [securityStep, setSecurityStep] = useState<'input' | 'analyzing' | 'review' | 'processing' | 'complete'>('input');
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentType | null>(null);
  const [fraudResult, setFraudResult] = useState<FraudDetectionResult | null>(null);
  const [requiresManualReview, setRequiresManualReview] = useState(false);
  const [additionalAuthRequired, setAdditionalAuthRequired] = useState(false);
  const [securityAnalysisProgress, setSecurityAnalysisProgress] = useState(0);

  /**
   * Step 1: Validate and prepare transaction data
   */
  const prepareTransactionData = () => {
    const transactionId = generateSecureTransactionId();
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      plugins: Array.from(navigator.plugins).map(p => p.name)
    };

    return {
      id: transactionId,
      userId: 'current_user_id', // Get from auth context
      amount: parseFloat(paymentData.amount),
      currency: 'USD',
      merchantCategory: 'retail', // Determine based on context
      paymentMethod: 'credit_card',
      cardLast4: paymentData.cardNumber.slice(-4),
      timestamp: new Date(),
      ipAddress: '192.168.1.100', // Get from request
      userAgent: navigator.userAgent,
      deviceFingerprint: generateDeviceFingerprint(deviceInfo),
      billingAddress: paymentData.billingAddress,
      isInternational: paymentData.billingAddress.country !== 'US',
      isFirstTimeVendor: false, // Check user history
      isHighRiskCategory: false, // Determine based on merchant
      isKnownDevice: true, // Check device history
      metadata: {
        sessionId: 'session_123',
        referrer: document.referrer,
        timestamp: Date.now()
      }
    };
  };

  /**
   * Step 2: Perform comprehensive security analysis
   */
  const performSecurityAnalysis = async (transactionData: any) => {
    setSecurityStep('analyzing');
    setSecurityAnalysisProgress(0);

    try {
      // Phase 1: Initial fraud detection (25%)
      setSecurityAnalysisProgress(25);
      const fraudDetectionResult = await detectFraud(transactionData);
      setFraudResult(fraudDetectionResult);

      // Phase 2: Risk assessment (50%)
      setSecurityAnalysisProgress(50);
      const riskAssessmentResult = await assessRisk(transactionData);
      setRiskAssessment(riskAssessmentResult);

      // Phase 3: Additional security checks (75%)
      setSecurityAnalysisProgress(75);
      const additionalRisk = assessTransactionRisk({
        amount: transactionData.amount,
        merchantCategory: transactionData.merchantCategory,
        paymentMethod: transactionData.paymentMethod,
        userHistory: {}, // Get from user service
        location: {
          country: transactionData.billingAddress.country,
          region: transactionData.billingAddress.state,
          city: transactionData.billingAddress.city,
          latitude: 0, // Get from IP geolocation
          longitude: 0,
          timezone: transactionData.deviceFingerprint.timezone
        },
        deviceFingerprint: transactionData.deviceFingerprint
      });

      // Phase 4: Final analysis and decision (100%)
      setSecurityAnalysisProgress(100);

      // Determine required actions
      const highRiskActions = [
        SecurityActionType.MANUAL_REVIEW_TRIGGERED,
        SecurityActionType.REQUIRE_ADDITIONAL_AUTH,
        SecurityActionType.BLOCK_TRANSACTION
      ];

      const requiresReview = fraudDetectionResult.recommendedActions.some(action => 
        action === SecurityActionType.MANUAL_REVIEW_TRIGGERED
      ) || riskAssessmentResult.requiresManualReview;

      const requiresAuth = fraudDetectionResult.recommendedActions.some(action => 
        action === SecurityActionType.REQUIRE_ADDITIONAL_AUTH
      );

      const shouldBlock = fraudDetectionResult.recommendedActions.some(action => 
        action === SecurityActionType.BLOCK_TRANSACTION
      );

      if (shouldBlock) {
        // Block transaction immediately
        await reportSecurityEvent({
          eventType: SecurityEventType.SUSPICIOUS_TRANSACTION,
          severity: SecuritySeverity.HIGH,
          description: `Transaction blocked due to high fraud risk (Score: ${fraudDetectionResult.riskScore})`,
          transactionId: transactionData.id,
          userId: transactionData.userId,
          metadata: {
            riskScore: fraudDetectionResult.riskScore,
            reasons: fraudDetectionResult.reasons,
            amount: transactionData.amount
          }
        });

        throw new Error('Transaction blocked due to security concerns. Please contact support.');
      }

      setRequiresManualReview(requiresReview);
      setAdditionalAuthRequired(requiresAuth);

      // Move to next step based on analysis
      if (requiresReview || requiresAuth) {
        setSecurityStep('review');
      } else {
        // Low risk - proceed with processing
        await processPayment(transactionData);
      }

    } catch (error) {
      console.error('Security analysis failed:', error);
      await reportSecurityEvent({
        eventType: SecurityEventType.SUSPICIOUS_TRANSACTION,
        severity: SecuritySeverity.MEDIUM,
        description: `Security analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        transactionId: transactionData.id,
        userId: transactionData.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  };

  /**
   * Step 3: Handle additional authentication if required
   */
  const handleAdditionalAuth = async () => {
    // Implement 2FA, SMS verification, etc.
    // For demo purposes, simulate success
    setAdditionalAuthRequired(false);
    
    if (!requiresManualReview) {
      const transactionData = prepareTransactionData();
      await processPayment(transactionData);
    }
  };

  /**
   * Step 4: Process the actual payment
   */
  const processPayment = async (transactionData: any) => {
    setSecurityStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log successful transaction
      await reportSecurityEvent({
        eventType: SecurityEventType.SUSPICIOUS_TRANSACTION, // Use appropriate event type
        severity: SecuritySeverity.LOW,
        description: 'Payment processed successfully',
        transactionId: transactionData.id,
        userId: transactionData.userId,
        metadata: {
          amount: transactionData.amount,
          status: 'completed',
          riskScore: fraudResult?.riskScore || 0
        }
      });

      setSecurityStep('complete');
      onPaymentComplete?.({
        transactionId: transactionData.id,
        amount: transactionData.amount,
        status: 'success',
        riskAssessment,
        fraudResult
      });

    } catch (error) {
      console.error('Payment processing failed:', error);
      await reportSecurityEvent({
        eventType: SecurityEventType.SUSPICIOUS_TRANSACTION,
        severity: SecuritySeverity.MEDIUM,
        description: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        transactionId: transactionData.id,
        userId: transactionData.userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      onPaymentError?.(error instanceof Error ? error.message : 'Payment processing failed');
    }
  };

  /**
   * Main payment submission handler
   */
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transactionData = prepareTransactionData();
      await performSecurityAnalysis(transactionData);
    } catch (error) {
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const getRiskColor = (riskLevel?: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.VERY_HIGH: return 'text-red-600';
      case RiskLevel.HIGH: return 'text-red-500';
      case RiskLevel.MEDIUM: return 'text-yellow-600';
      case RiskLevel.LOW: return 'text-green-500';
      case RiskLevel.VERY_LOW: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (riskLevel?: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.VERY_HIGH:
      case RiskLevel.HIGH:
        return <AlertTriangle className="h-5 w-5" />;
      case RiskLevel.MEDIUM:
        return <Clock className="h-5 w-5" />;
      case RiskLevel.LOW:
      case RiskLevel.VERY_LOW:
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  if (securityStep === 'analyzing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <CardTitle>Analyzing Transaction Security</CardTitle>
          <CardDescription>
            Performing comprehensive fraud detection and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={securityAnalysisProgress} className="w-full" />
            <div className="text-center text-sm text-gray-600">
              {securityAnalysisProgress < 25 && "Running fraud detection algorithms..."}
              {securityAnalysisProgress >= 25 && securityAnalysisProgress < 50 && "Performing risk assessment..."}
              {securityAnalysisProgress >= 50 && securityAnalysisProgress < 75 && "Checking security parameters..."}
              {securityAnalysisProgress >= 75 && securityAnalysisProgress < 100 && "Finalizing security analysis..."}
              {securityAnalysisProgress === 100 && "Security analysis complete!"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (securityStep === 'review') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Security Review Required</span>
          </CardTitle>
          <CardDescription>
            This transaction requires additional security verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Assessment Results */}
          {riskAssessment && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Risk Assessment</h4>
                <div className={`flex items-center space-x-2 ${getRiskColor(fraudResult?.riskLevel)}`}>
                  {getRiskIcon(fraudResult?.riskLevel)}
                  <span className="font-semibold">
                    Score: {riskAssessment.overallRiskScore}/100
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Risk Level:</span>
                  <Badge variant="outline" className="ml-2">
                    {fraudResult?.riskLevel?.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Manual Review:</span>
                  <Badge variant={requiresManualReview ? "destructive" : "default"} className="ml-2">
                    {requiresManualReview ? "Required" : "Not Required"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Detection Results */}
          {fraudResult && fraudResult.reasons.length > 0 && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Security Concerns</h4>
              <div className="space-y-2">
                {fraudResult.reasons.slice(0, 3).map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{reason.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Actions */}
          <div className="space-y-4">
            {additionalAuthRequired && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Additional Authentication Required</AlertTitle>
                <AlertDescription>
                  Please complete two-factor authentication to proceed with this transaction.
                </AlertDescription>
              </Alert>
            )}

            {requiresManualReview && (
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertTitle>Manual Review Required</AlertTitle>
                <AlertDescription>
                  This transaction will be reviewed by our security team. You will receive an update within 24 hours.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {additionalAuthRequired && !requiresManualReview && (
              <Button onClick={handleAdditionalAuth} className="flex-1">
                Complete Additional Authentication
              </Button>
            )}
            
            {requiresManualReview && (
              <Button variant="outline" className="flex-1" disabled>
                Awaiting Manual Review
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setSecurityStep('input')}
              className="flex-1"
            >
              Modify Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (securityStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CreditCard className="h-8 w-8 text-green-600 animate-pulse" />
          </div>
          <CardTitle>Processing Payment</CardTitle>
          <CardDescription>
            Your payment is being processed securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4">Please do not close this window</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (securityStep === 'complete') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>
            Your transaction has been completed securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold ml-2">${paymentData.amount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Security Score:</span>
                  <span className="font-semibold ml-2">{fraudResult?.riskScore || 0}/100</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setSecurityStep('input')} className="w-full">
              Process Another Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Payment form (default step)
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Secure Payment</span>
        </CardTitle>
        <CardDescription>
          Protected by advanced fraud detection and security monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          {/* Card Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              value={paymentData.cardholderName}
              onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              This payment will be analyzed using advanced fraud detection algorithms. 
              Additional verification may be required for high-risk transactions.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Process Secure Payment
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}