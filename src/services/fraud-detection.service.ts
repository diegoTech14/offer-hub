/**
 * Fraud Detection and Prevention Service
 * Advanced machine learning-based fraud detection with pattern recognition
 */

import {
  FraudDetectionResult,
  RiskLevel,
  FraudReason,
  FraudCategory,
  SecurityActionType,
  GeoLocation,
  DeviceFingerprint,
  VelocityLimits,
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity
} from '@/types/payment-security.types';

export class FraudDetectionService {
  private readonly API_BASE = '/api/security';
  private modelVersion = '2.1.0';
  private readonly riskWeights = {
    velocityCheck: 0.25,
    locationAnalysis: 0.20,
    deviceTrust: 0.15,
    behavioralPattern: 0.20,
    transactionPattern: 0.20
  };

  /**
   * Main fraud detection analysis function
   */
  async analyzeTransaction(transactionData: any): Promise<FraudDetectionResult> {
    try {
      const startTime = Date.now();
      
      // Parallel analysis for better performance
      const [
        velocityResult,
        locationResult,
        deviceResult,
        behavioralResult,
        transactionResult
      ] = await Promise.all([
        this.analyzeVelocityPatterns(transactionData),
        this.analyzeLocationAnomaly(transactionData),
        this.analyzeDeviceTrust(transactionData),
        this.analyzeBehavioralPatterns(transactionData),
        this.analyzeTransactionPatterns(transactionData)
      ]);

      const fraudReasons: FraudReason[] = [
        ...velocityResult.reasons,
        ...locationResult.reasons,
        ...deviceResult.reasons,
        ...behavioralResult.reasons,
        ...transactionResult.reasons
      ];

      // Calculate weighted risk score
      const riskScore = this.calculateWeightedRiskScore({
        velocity: velocityResult.score,
        location: locationResult.score,
        device: deviceResult.score,
        behavioral: behavioralResult.score,
        transaction: transactionResult.score
      });

      const riskLevel = this.determineRiskLevel(riskScore);
      const recommendedActions = this.getRecommendedActions(riskLevel, fraudReasons);
      const confidence = this.calculateConfidence(fraudReasons);

      const result: FraudDetectionResult = {
        riskScore,
        riskLevel,
        reasons: fraudReasons,
        recommendedActions,
        confidence,
        modelVersion: this.modelVersion,
        processedAt: new Date()
      };

      // Log analysis for monitoring
      await this.logFraudAnalysis(transactionData, result, Date.now() - startTime);

      return result;
    } catch (error) {
      console.error('Fraud detection analysis failed:', error);
      return this.createFailsafeResult();
    }
  }

  /**
   * Analyze transaction velocity patterns
   */
  private async analyzeVelocityPatterns(transactionData: any): Promise<{
    score: number;
    reasons: FraudReason[];
  }> {
    const reasons: FraudReason[] = [];
    let score = 0;

    try {
      const velocityData = await this.getVelocityData(transactionData.userId);
      const limits = await this.getVelocityLimits();

      // Check transactions per time period
      if (velocityData.transactionsLastHour > limits.transactionsPerHour) {
        score += 30;
        reasons.push({
          code: 'VELOCITY_TRANSACTIONS_HOUR',
          description: `Exceeded hourly transaction limit: ${velocityData.transactionsLastHour}/${limits.transactionsPerHour}`,
          weight: 0.3,
          category: FraudCategory.VELOCITY
        });
      }

      if (velocityData.transactionsLastDay > limits.transactionsPerDay) {
        score += 25;
        reasons.push({
          code: 'VELOCITY_TRANSACTIONS_DAY',
          description: `Exceeded daily transaction limit: ${velocityData.transactionsLastDay}/${limits.transactionsPerDay}`,
          weight: 0.25,
          category: FraudCategory.VELOCITY
        });
      }

      // Check amount velocity
      if (velocityData.amountLastHour > limits.amountPerHour) {
        score += 35;
        reasons.push({
          code: 'VELOCITY_AMOUNT_HOUR',
          description: `Exceeded hourly amount limit: $${velocityData.amountLastHour}/$${limits.amountPerHour}`,
          weight: 0.35,
          category: FraudCategory.VELOCITY
        });
      }

      // Sudden spike detection
      const avgHourlyAmount = velocityData.avgHourlyAmountLast7Days;
      if (transactionData.amount > avgHourlyAmount * 5) {
        score += 20;
        reasons.push({
          code: 'VELOCITY_SPIKE_DETECTION',
          description: `Transaction amount significantly higher than usual pattern`,
          weight: 0.2,
          category: FraudCategory.VELOCITY
        });
      }

    } catch (error) {
      console.error('Velocity analysis failed:', error);
      score = 10; // Conservative score on failure
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Analyze location-based fraud indicators
   */
  private async analyzeLocationAnomaly(transactionData: any): Promise<{
    score: number;
    reasons: FraudReason[];
  }> {
    const reasons: FraudReason[] = [];
    let score = 0;

    try {
      const currentLocation = await this.getLocationFromIP(transactionData.ipAddress);
      const userLocationHistory = await this.getUserLocationHistory(transactionData.userId);

      // Check for impossible travel
      const lastTransaction = userLocationHistory[0];
      if (lastTransaction && this.isImpossibleTravel(lastTransaction, currentLocation, transactionData.timestamp)) {
        score += 40;
        reasons.push({
          code: 'IMPOSSIBLE_TRAVEL',
          description: `Impossible travel detected: ${this.calculateDistance(lastTransaction.location, currentLocation)}km in ${this.calculateTimeDiff(lastTransaction.timestamp, transactionData.timestamp)} minutes`,
          weight: 0.4,
          category: FraudCategory.LOCATION
        });
      }

      // Check for high-risk countries
      if (await this.isHighRiskCountry(currentLocation.country)) {
        score += 25;
        reasons.push({
          code: 'HIGH_RISK_COUNTRY',
          description: `Transaction from high-risk country: ${currentLocation.country}`,
          weight: 0.25,
          category: FraudCategory.LOCATION
        });
      }

      // Check for VPN/Proxy usage
      if (currentLocation.isVpn || currentLocation.isTor) {
        score += 15;
        reasons.push({
          code: 'VPN_TOR_USAGE',
          description: `VPN or Tor usage detected`,
          weight: 0.15,
          category: FraudCategory.LOCATION
        });
      }

      // Location consistency check
      const locationConsistency = this.calculateLocationConsistency(userLocationHistory, currentLocation);
      if (locationConsistency < 0.3) {
        score += 20;
        reasons.push({
          code: 'LOCATION_INCONSISTENCY',
          description: `Low location consistency score: ${locationConsistency.toFixed(2)}`,
          weight: 0.2,
          category: FraudCategory.LOCATION
        });
      }

    } catch (error) {
      console.error('Location analysis failed:', error);
      score = 5;
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Analyze device trust and fingerprint
   */
  private async analyzeDeviceTrust(transactionData: any): Promise<{
    score: number;
    reasons: FraudReason[];
  }> {
    const reasons: FraudReason[] = [];
    let score = 0;

    try {
      const deviceFingerprint = await this.generateDeviceFingerprint(transactionData);
      const deviceHistory = await this.getDeviceHistory(transactionData.userId);

      // Check if device is known
      const knownDevice = deviceHistory.find(d => d.id === deviceFingerprint.id);
      if (!knownDevice) {
        score += 20;
        reasons.push({
          code: 'UNKNOWN_DEVICE',
          description: 'Transaction from unknown device',
          weight: 0.2,
          category: FraudCategory.DEVICE
        });
      } else if (knownDevice.trustScore < 50) {
        score += 15;
        reasons.push({
          code: 'LOW_DEVICE_TRUST',
          description: `Device has low trust score: ${knownDevice.trustScore}`,
          weight: 0.15,
          category: FraudCategory.DEVICE
        });
      }

      // Check for device anomalies
      const deviceAnomalies = this.detectDeviceAnomalies(deviceFingerprint, deviceHistory);
      score += deviceAnomalies.score;
      reasons.push(...deviceAnomalies.reasons);

      // Browser/app security check
      if (this.isInsecureBrowser(transactionData.userAgent)) {
        score += 10;
        reasons.push({
          code: 'INSECURE_BROWSER',
          description: 'Transaction from potentially insecure browser or app',
          weight: 0.1,
          category: FraudCategory.DEVICE
        });
      }

    } catch (error) {
      console.error('Device analysis failed:', error);
      score = 5;
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Analyze behavioral patterns using ML
   */
  private async analyzeBehavioralPatterns(transactionData: any): Promise<{
    score: number;
    reasons: FraudReason[];
  }> {
    const reasons: FraudReason[] = [];
    let score = 0;

    try {
      const userBehavior = await this.getUserBehaviorProfile(transactionData.userId);
      
      // Time-based behavior analysis
      const timeAnomaly = this.analyzeTimePatterns(transactionData, userBehavior);
      if (timeAnomaly.isAnomalous) {
        score += timeAnomaly.score;
        reasons.push({
          code: 'TIME_PATTERN_ANOMALY',
          description: timeAnomaly.description,
          weight: 0.15,
          category: FraudCategory.BEHAVIORAL
        });
      }

      // Transaction amount patterns
      const amountAnomaly = this.analyzeAmountPatterns(transactionData, userBehavior);
      if (amountAnomaly.isAnomalous) {
        score += amountAnomaly.score;
        reasons.push({
          code: 'AMOUNT_PATTERN_ANOMALY',
          description: amountAnomaly.description,
          weight: 0.2,
          category: FraudCategory.BEHAVIORAL
        });
      }

      // Merchant/recipient patterns
      const merchantAnomaly = this.analyzeMerchantPatterns(transactionData, userBehavior);
      if (merchantAnomaly.isAnomalous) {
        score += merchantAnomaly.score;
        reasons.push({
          code: 'MERCHANT_PATTERN_ANOMALY',
          description: merchantAnomaly.description,
          weight: 0.15,
          category: FraudCategory.BEHAVIORAL
        });
      }

      // Session behavior analysis
      const sessionAnomaly = await this.analyzeSessionBehavior(transactionData);
      if (sessionAnomaly.isAnomalous) {
        score += sessionAnomaly.score;
        reasons.push({
          code: 'SESSION_BEHAVIOR_ANOMALY',
          description: sessionAnomaly.description,
          weight: 0.1,
          category: FraudCategory.BEHAVIORAL
        });
      }

    } catch (error) {
      console.error('Behavioral analysis failed:', error);
      score = 5;
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Analyze transaction-specific patterns
   */
  private async analyzeTransactionPatterns(transactionData: any): Promise<{
    score: number;
    reasons: FraudReason[];
  }> {
    const reasons: FraudReason[] = [];
    let score = 0;

    try {
      // Amount analysis
      if (transactionData.amount > 10000) {
        score += 15;
        reasons.push({
          code: 'HIGH_VALUE_TRANSACTION',
          description: `High-value transaction: $${transactionData.amount}`,
          weight: 0.15,
          category: FraudCategory.TRANSACTIONAL
        });
      }

      // Round number detection (often fraudulent)
      if (this.isRoundNumber(transactionData.amount)) {
        score += 5;
        reasons.push({
          code: 'ROUND_NUMBER_AMOUNT',
          description: 'Transaction amount is a round number',
          weight: 0.05,
          category: FraudCategory.TRANSACTIONAL
        });
      }

      // Payment method risk
      const paymentMethodRisk = this.assessPaymentMethodRisk(transactionData.paymentMethod);
      if (paymentMethodRisk.isHighRisk) {
        score += paymentMethodRisk.score;
        reasons.push({
          code: 'HIGH_RISK_PAYMENT_METHOD',
          description: paymentMethodRisk.description,
          weight: 0.1,
          category: FraudCategory.TRANSACTIONAL
        });
      }

      // Transaction frequency patterns
      const frequencyAnomaly = await this.analyzeTransactionFrequency(transactionData);
      if (frequencyAnomaly.isAnomalous) {
        score += frequencyAnomaly.score;
        reasons.push({
          code: 'FREQUENCY_ANOMALY',
          description: frequencyAnomaly.description,
          weight: 0.15,
          category: FraudCategory.TRANSACTIONAL
        });
      }

    } catch (error) {
      console.error('Transaction pattern analysis failed:', error);
      score = 5;
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Calculate weighted risk score
   */
  private calculateWeightedRiskScore(scores: {
    velocity: number;
    location: number;
    device: number;
    behavioral: number;
    transaction: number;
  }): number {
    return Math.round(
      scores.velocity * this.riskWeights.velocityCheck +
      scores.location * this.riskWeights.locationAnalysis +
      scores.device * this.riskWeights.deviceTrust +
      scores.behavioral * this.riskWeights.behavioralPattern +
      scores.transaction * this.riskWeights.transactionPattern
    );
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 80) return RiskLevel.VERY_HIGH;
    if (riskScore >= 60) return RiskLevel.HIGH;
    if (riskScore >= 40) return RiskLevel.MEDIUM;
    if (riskScore >= 20) return RiskLevel.LOW;
    return RiskLevel.VERY_LOW;
  }

  /**
   * Get recommended security actions
   */
  private getRecommendedActions(riskLevel: RiskLevel, reasons: FraudReason[]): SecurityActionType[] {
    const actions: SecurityActionType[] = [];

    switch (riskLevel) {
      case RiskLevel.VERY_HIGH:
        actions.push(
          SecurityActionType.BLOCK_TRANSACTION,
          SecurityActionType.ESCALATE_TO_ADMIN,
          SecurityActionType.TEMPORARY_ACCOUNT_LOCK
        );
        break;
      case RiskLevel.HIGH:
        actions.push(
          SecurityActionType.REQUIRE_ADDITIONAL_AUTH,
          SecurityActionType.MANUAL_REVIEW_TRIGGERED,
          SecurityActionType.ALERT_SENT
        );
        break;
      case RiskLevel.MEDIUM:
        actions.push(
          SecurityActionType.REQUIRE_ADDITIONAL_AUTH,
          SecurityActionType.ALERT_SENT
        );
        break;
      case RiskLevel.LOW:
        actions.push(SecurityActionType.ALERT_SENT);
        break;
      default:
        // No actions for very low risk
        break;
    }

    // Add specific actions based on fraud reasons
    const deviceReasons = reasons.filter(r => r.category === FraudCategory.DEVICE);
    if (deviceReasons.length > 0) {
      actions.push(SecurityActionType.DEVICE_BLOCKED);
    }

    const locationReasons = reasons.filter(r => r.category === FraudCategory.LOCATION);
    if (locationReasons.some(r => r.code === 'HIGH_RISK_COUNTRY')) {
      actions.push(SecurityActionType.IP_BLOCKED);
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(reasons: FraudReason[]): number {
    if (reasons.length === 0) return 1.0;

    const totalWeight = reasons.reduce((sum, reason) => sum + reason.weight, 0);
    const weightedConfidence = reasons.reduce((sum, reason) => {
      // Higher weight and more specific reasons increase confidence
      const reasonConfidence = Math.min(reason.weight * 2, 1.0);
      return sum + (reasonConfidence * reason.weight);
    }, 0);

    return Math.min(weightedConfidence / totalWeight, 1.0);
  }

  /**
   * Create failsafe result when analysis fails
   */
  private createFailsafeResult(): FraudDetectionResult {
    return {
      riskScore: 50, // Medium risk as failsafe
      riskLevel: RiskLevel.MEDIUM,
      reasons: [{
        code: 'ANALYSIS_FAILED',
        description: 'Fraud analysis failed - applying conservative measures',
        weight: 1.0,
        category: FraudCategory.BEHAVIORAL
      }],
      recommendedActions: [SecurityActionType.MANUAL_REVIEW_TRIGGERED],
      confidence: 0.5,
      modelVersion: this.modelVersion,
      processedAt: new Date()
    };
  }

  // Helper methods for external API calls
  private async getVelocityData(userId: string): Promise<any> {
    const response = await fetch(`${this.API_BASE}/velocity/${userId}`);
    return response.json();
  }

  private async getVelocityLimits(): Promise<VelocityLimits> {
    const response = await fetch(`${this.API_BASE}/config/velocity-limits`);
    return response.json();
  }

  private async getLocationFromIP(ipAddress: string): Promise<GeoLocation> {
    const response = await fetch(`${this.API_BASE}/geolocation/${ipAddress}`);
    return response.json();
  }

  private async getUserLocationHistory(userId: string): Promise<any[]> {
    const response = await fetch(`${this.API_BASE}/users/${userId}/location-history`);
    return response.json();
  }

  private async isHighRiskCountry(country: string): Promise<boolean> {
    const response = await fetch(`${this.API_BASE}/config/high-risk-countries`);
    const data = await response.json();
    return data.countries.includes(country);
  }

  private async generateDeviceFingerprint(transactionData: any): Promise<DeviceFingerprint> {
    const response = await fetch(`${this.API_BASE}/device/fingerprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return response.json();
  }

  private async getDeviceHistory(userId: string): Promise<DeviceFingerprint[]> {
    const response = await fetch(`${this.API_BASE}/users/${userId}/devices`);
    return response.json();
  }

  private async getUserBehaviorProfile(userId: string): Promise<any> {
    const response = await fetch(`${this.API_BASE}/users/${userId}/behavior-profile`);
    return response.json();
  }

  private async logFraudAnalysis(transactionData: any, result: FraudDetectionResult, processingTime: number): Promise<void> {
    await fetch(`${this.API_BASE}/fraud-analysis/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: transactionData.id,
        userId: transactionData.userId,
        result,
        processingTime,
        timestamp: new Date()
      })
    });
  }

  // Utility methods
  private isImpossibleTravel(lastTransaction: any, currentLocation: GeoLocation, currentTime: Date): boolean {
    const distance = this.calculateDistance(lastTransaction.location, currentLocation);
    const timeDiff = this.calculateTimeDiff(lastTransaction.timestamp, currentTime);
    const maxSpeed = 900; // km/h (commercial flight speed)
    
    return (distance / timeDiff) * 60 > maxSpeed;
  }

  private calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    const lat1 = this.toRad(loc1.latitude);
    const lat2 = this.toRad(loc2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  private calculateTimeDiff(time1: Date, time2: Date): number {
    return Math.abs(new Date(time2).getTime() - new Date(time1).getTime()) / (1000 * 60); // minutes
  }

  private calculateLocationConsistency(history: any[], current: GeoLocation): number {
    if (history.length === 0) return 0.5;
    
    const countryMatches = history.filter(h => h.location.country === current.country).length;
    return countryMatches / history.length;
  }

  private detectDeviceAnomalies(current: DeviceFingerprint, history: DeviceFingerprint[]): { score: number; reasons: FraudReason[] } {
    const reasons: FraudReason[] = [];
    let score = 0;

    // Check for multiple users on same device
    if (current.associated_users.length > 3) {
      score += 15;
      reasons.push({
        code: 'MULTIPLE_USERS_DEVICE',
        description: `Device associated with ${current.associated_users.length} users`,
        weight: 0.15,
        category: FraudCategory.DEVICE
      });
    }

    return { score, reasons };
  }

  private isInsecureBrowser(userAgent: string): boolean {
    const insecurePatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i
    ];
    
    return insecurePatterns.some(pattern => pattern.test(userAgent));
  }

  private analyzeTimePatterns(transactionData: any, userBehavior: any): { isAnomalous: boolean; score: number; description: string } {
    const transactionHour = new Date(transactionData.timestamp).getHours();
    const userTypicalHours = userBehavior.typicalTransactionHours || [];
    
    if (userTypicalHours.length > 0 && !userTypicalHours.includes(transactionHour)) {
      return {
        isAnomalous: true,
        score: 10,
        description: `Transaction at unusual time: ${transactionHour}:00`
      };
    }
    
    return { isAnomalous: false, score: 0, description: '' };
  }

  private analyzeAmountPatterns(transactionData: any, userBehavior: any): { isAnomalous: boolean; score: number; description: string } {
    const amount = transactionData.amount;
    const avgAmount = userBehavior.averageTransactionAmount || 0;
    const stdDev = userBehavior.transactionAmountStdDev || 0;
    
    if (avgAmount > 0 && Math.abs(amount - avgAmount) > (3 * stdDev)) {
      return {
        isAnomalous: true,
        score: 20,
        description: `Transaction amount significantly deviates from user pattern`
      };
    }
    
    return { isAnomalous: false, score: 0, description: '' };
  }

  private analyzeMerchantPatterns(transactionData: any, userBehavior: any): { isAnomalous: boolean; score: number; description: string } {
    const merchantCategory = transactionData.merchantCategory;
    const userCategories = userBehavior.frequentMerchantCategories || [];
    
    if (userCategories.length > 0 && !userCategories.includes(merchantCategory)) {
      return {
        isAnomalous: true,
        score: 10,
        description: `Transaction in unusual merchant category: ${merchantCategory}`
      };
    }
    
    return { isAnomalous: false, score: 0, description: '' };
  }

  private async analyzeSessionBehavior(transactionData: any): Promise<{ isAnomalous: boolean; score: number; description: string }> {
    // This would analyze user's session behavior patterns
    // For now, returning a simple implementation
    return { isAnomalous: false, score: 0, description: '' };
  }

  private isRoundNumber(amount: number): boolean {
    return amount % 100 === 0 || amount % 50 === 0;
  }

  private assessPaymentMethodRisk(paymentMethod: string): { isHighRisk: boolean; score: number; description: string } {
    const highRiskMethods = ['prepaid_card', 'gift_card', 'cryptocurrency'];
    
    if (highRiskMethods.includes(paymentMethod)) {
      return {
        isHighRisk: true,
        score: 15,
        description: `High-risk payment method: ${paymentMethod}`
      };
    }
    
    return { isHighRisk: false, score: 0, description: '' };
  }

  private async analyzeTransactionFrequency(transactionData: any): Promise<{ isAnomalous: boolean; score: number; description: string }> {
    // This would analyze transaction frequency patterns
    // For now, returning a simple implementation
    return { isAnomalous: false, score: 0, description: '' };
  }

  /**
   * Report fraud feedback for model improvement
   */
  async reportFraudFeedback(transactionId: string, isFraud: boolean): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/fraud-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          isFraud,
          timestamp: new Date(),
          modelVersion: this.modelVersion
        })
      });
    } catch (error) {
      console.error('Failed to report fraud feedback:', error);
    }
  }

  /**
   * Update machine learning model
   */
  async updateModel(trainingData: any[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/model/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingData })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to update ML model:', error);
      return false;
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/model/metrics`);
      return response.json();
    } catch (error) {
      console.error('Failed to get model metrics:', error);
      return null;
    }
  }
}

export const fraudDetectionService = new FraudDetectionService();