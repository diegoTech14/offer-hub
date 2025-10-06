/**
 * Security Utility Functions and Fraud Prevention Algorithms
 * Comprehensive utility functions for payment security and fraud detection
 */

import {
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  GeoLocation,
  DeviceFingerprint,
  VelocityLimits,
  RiskLevel,
  SecurityActionType
} from '@/types/payment-security.types';

// Cryptographic and security constants
const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  MAX_TRANSACTION_AMOUNT: 50000,
  VELOCITY_CHECK_WINDOW: 60 * 60 * 1000, // 1 hour
  GEOLOCATION_ACCURACY_THRESHOLD: 1000, // meters
  DEVICE_FINGERPRINT_SIMILARITY_THRESHOLD: 0.85,
  IP_REPUTATION_CACHE_TTL: 60 * 60 * 1000, // 1 hour
};

/**
 * Generate a unique transaction ID with security considerations
 */
export function generateSecureTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  const securitySuffix = generateRandomString(6);
  
  return `txn_${timestamp}_${randomPart}_${securitySuffix}`.toUpperCase();
}

/**
 * Generate a cryptographically secure random string
 */
export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser), otherwise use Math.random
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  
  return result;
}

/**
 * Hash sensitive data using a simple hash function
 * Note: In production, use proper cryptographic libraries like bcrypt
 */
export function hashSensitiveData(data: string): string {
  let hash = 0;
  if (data.length === 0) return hash.toString();
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Validate and sanitize input data
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Check if an IP address is potentially malicious
 */
export function isHighRiskIP(ipAddress: string): boolean {
  // Simple IP reputation check - in production, use proper IP reputation services
  const highRiskPatterns = [
    /^10\./, // Private networks (suspicious for public transactions)
    /^192\.168\./, // Private networks
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private networks
    /^127\./, // Loopback
    /^0\./, // Invalid
    /^169\.254\./, // Link-local
  ];
  
  return highRiskPatterns.some(pattern => pattern.test(ipAddress));
}

/**
 * Detect VPN or proxy usage from IP analysis
 */
export function detectVPNOrProxy(ipAddress: string, headers: Record<string, string>): {
  isVPN: boolean;
  isProxy: boolean;
  confidence: number;
} {
  let vpnScore = 0;
  let proxyScore = 0;
  
  // Check common VPN/proxy headers
  const vpnHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'cf-connecting-ip',
    'true-client-ip'
  ];
  
  vpnHeaders.forEach(header => {
    if (headers[header.toLowerCase()]) {
      vpnScore += 0.2;
    }
  });
  
  // Check for proxy indicators
  if (headers['via']) proxyScore += 0.3;
  if (headers['x-forwarded-proto']) proxyScore += 0.2;
  if (headers['x-forwarded-host']) proxyScore += 0.2;
  
  // Check IP ranges commonly used by VPN providers
  const vpnRanges = [
    /^5\./, // Some VPN providers
    /^31\./, // Some VPN providers
    /^46\./, // Some VPN providers
  ];
  
  if (vpnRanges.some(range => range.test(ipAddress))) {
    vpnScore += 0.3;
  }
  
  return {
    isVPN: vpnScore > 0.5,
    isProxy: proxyScore > 0.5,
    confidence: Math.max(vpnScore, proxyScore)
  };
}

/**
 * Calculate distance between two geographic locations
 */
export function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) * Math.cos(toRadians(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check for impossible travel between transactions
 */
export function detectImpossibleTravel(
  lastLocation: GeoLocation,
  currentLocation: GeoLocation,
  timeDifferenceMinutes: number
): {
  isImpossible: boolean;
  distance: number;
  requiredSpeed: number;
  confidence: number;
} {
  const distance = calculateDistance(lastLocation, currentLocation);
  const requiredSpeedKmh = (distance / timeDifferenceMinutes) * 60;
  
  // Maximum reasonable speed (including commercial flights)
  const maxReasonableSpeed = 900; // km/h
  
  const isImpossible = requiredSpeedKmh > maxReasonableSpeed;
  const confidence = Math.min(requiredSpeedKmh / maxReasonableSpeed, 2.0);
  
  return {
    isImpossible,
    distance,
    requiredSpeed: requiredSpeedKmh,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Generate device fingerprint from browser/device information
 */
export function generateDeviceFingerprint(deviceInfo: {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  canvas?: string;
  webgl?: string;
}): DeviceFingerprint {
  const fingerprintData = [
    deviceInfo.userAgent,
    deviceInfo.screenResolution,
    deviceInfo.timezone,
    deviceInfo.language,
    deviceInfo.platform,
    deviceInfo.plugins.join(','),
    deviceInfo.canvas || '',
    deviceInfo.webgl || ''
  ].join('|');
  
  const fingerprintHash = hashSensitiveData(fingerprintData);
  
  return {
    id: `fp_${fingerprintHash}`,
    userAgent: deviceInfo.userAgent,
    screenResolution: deviceInfo.screenResolution,
    timezone: deviceInfo.timezone,
    language: deviceInfo.language,
    platform: deviceInfo.platform,
    plugins: deviceInfo.plugins,
    canvas: deviceInfo.canvas || '',
    webgl: deviceInfo.webgl || '',
    trustScore: 50, // Default trust score
    firstSeen: new Date(),
    lastSeen: new Date(),
    associated_users: []
  };
}

/**
 * Compare device fingerprints for similarity
 */
export function compareDeviceFingerprints(
  fingerprint1: DeviceFingerprint,
  fingerprint2: DeviceFingerprint
): number {
  const features = [
    'userAgent',
    'screenResolution',
    'timezone',
    'language',
    'platform'
  ];
  
  let matches = 0;
  let total = features.length;
  
  features.forEach(feature => {
    if (fingerprint1[feature as keyof DeviceFingerprint] === fingerprint2[feature as keyof DeviceFingerprint]) {
      matches++;
    }
  });
  
  // Compare plugins array
  const plugins1 = new Set(fingerprint1.plugins);
  const plugins2 = new Set(fingerprint2.plugins);
  const pluginSimilarity = calculateSetSimilarity(plugins1, plugins2);
  
  return (matches / total) * 0.8 + pluginSimilarity * 0.2;
}

/**
 * Calculate similarity between two sets
 */
function calculateSetSimilarity<T>(set1: Set<T>, set2: Set<T>): number {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Velocity pattern analysis
 */
export function analyzeVelocityPattern(transactions: Array<{
  timestamp: Date;
  amount: number;
  userId: string;
}>): {
  isAnomalous: boolean;
  riskScore: number;
  patterns: string[];
} {
  const patterns: string[] = [];
  let riskScore = 0;
  
  // Sort transactions by timestamp
  const sortedTransactions = transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Check for rapid-fire transactions
  const rapidTransactions = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const timeDiff = sortedTransactions[i].timestamp.getTime() - sortedTransactions[i - 1].timestamp.getTime();
    if (timeDiff < 30000) { // 30 seconds
      rapidTransactions.push(timeDiff);
    }
  }
  
  if (rapidTransactions.length > 0) {
    patterns.push('Rapid consecutive transactions detected');
    riskScore += 25;
  }
  
  // Check for unusual amounts
  const amounts = transactions.map(t => t.amount);
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length);
  
  const unusualAmounts = amounts.filter(amount => Math.abs(amount - avgAmount) > 2 * stdDev);
  if (unusualAmounts.length > 0) {
    patterns.push('Unusual transaction amounts detected');
    riskScore += 15;
  }
  
  // Check for round number patterns (often fraudulent)
  const roundNumbers = amounts.filter(amount => amount % 100 === 0 || amount % 50 === 0);
  if (roundNumbers.length / amounts.length > 0.5) {
    patterns.push('High frequency of round number amounts');
    riskScore += 10;
  }
  
  return {
    isAnomalous: riskScore > 20,
    riskScore: Math.min(riskScore, 100),
    patterns
  };
}

/**
 * Time-based behavior analysis
 */
export function analyzeTimePatterns(transactions: Array<{
  timestamp: Date;
  userId: string;
}>): {
  typicalHours: number[];
  typicalDays: number[];
  isNightOwl: boolean;
  hasWeekendActivity: boolean;
} {
  const hours = transactions.map(t => t.timestamp.getHours());
  const days = transactions.map(t => t.timestamp.getDay()); // 0 = Sunday
  
  // Find most common hours
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const typicalHours = Object.entries(hourCounts)
    .filter(([, count]) => count >= transactions.length * 0.1) // At least 10% of transactions
    .map(([hour]) => parseInt(hour));
  
  // Find typical days
  const dayCounts = days.reduce((acc, day) => {
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const typicalDays = Object.entries(dayCounts)
    .filter(([, count]) => count >= transactions.length * 0.1)
    .map(([day]) => parseInt(day));
  
  const nightHours = hours.filter(hour => hour >= 22 || hour <= 6);
  const weekendTransactions = days.filter(day => day === 0 || day === 6);
  
  return {
    typicalHours,
    typicalDays,
    isNightOwl: nightHours.length / hours.length > 0.3,
    hasWeekendActivity: weekendTransactions.length > 0
  };
}

/**
 * Risk assessment based on transaction context
 */
export function assessTransactionRisk(transactionData: {
  amount: number;
  merchantCategory: string;
  paymentMethod: string;
  userHistory: any;
  location: GeoLocation;
  deviceFingerprint: DeviceFingerprint;
}): {
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: string[];
  recommendedActions: SecurityActionType[];
} {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendedActions: SecurityActionType[] = [];
  
  // Amount-based risk
  if (transactionData.amount > 10000) {
    riskScore += 30;
    riskFactors.push('High-value transaction');
    recommendedActions.push(SecurityActionType.REQUIRE_ADDITIONAL_AUTH);
  } else if (transactionData.amount > 5000) {
    riskScore += 15;
    riskFactors.push('Medium-value transaction');
  }
  
  // Merchant category risk
  const highRiskCategories = ['gambling', 'cryptocurrency', 'adult', 'weapons'];
  if (highRiskCategories.includes(transactionData.merchantCategory.toLowerCase())) {
    riskScore += 25;
    riskFactors.push('High-risk merchant category');
    recommendedActions.push(SecurityActionType.MANUAL_REVIEW_TRIGGERED);
  }
  
  // Payment method risk
  const highRiskPaymentMethods = ['prepaid_card', 'gift_card', 'cryptocurrency'];
  if (highRiskPaymentMethods.includes(transactionData.paymentMethod)) {
    riskScore += 20;
    riskFactors.push('High-risk payment method');
  }
  
  // Device trust
  if (transactionData.deviceFingerprint.trustScore < 30) {
    riskScore += 25;
    riskFactors.push('Low device trust score');
    recommendedActions.push(SecurityActionType.DEVICE_BLOCKED);
  }
  
  // Location risk
  if (transactionData.location.isVpn || transactionData.location.isTor) {
    riskScore += 15;
    riskFactors.push('VPN/Tor usage detected');
  }
  
  // Determine risk level
  let riskLevel: RiskLevel;
  if (riskScore >= 80) {
    riskLevel = RiskLevel.VERY_HIGH;
    recommendedActions.push(SecurityActionType.BLOCK_TRANSACTION, SecurityActionType.ESCALATE_TO_ADMIN);
  } else if (riskScore >= 60) {
    riskLevel = RiskLevel.HIGH;
    recommendedActions.push(SecurityActionType.REQUIRE_ADDITIONAL_AUTH, SecurityActionType.MANUAL_REVIEW_TRIGGERED);
  } else if (riskScore >= 40) {
    riskLevel = RiskLevel.MEDIUM;
    recommendedActions.push(SecurityActionType.REQUIRE_ADDITIONAL_AUTH);
  } else if (riskScore >= 20) {
    riskLevel = RiskLevel.LOW;
    recommendedActions.push(SecurityActionType.ALERT_SENT);
  } else {
    riskLevel = RiskLevel.VERY_LOW;
  }
  
  return {
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    riskFactors,
    recommendedActions: [...new Set(recommendedActions)]
  };
}

/**
 * Create security event from transaction analysis
 */
export function createSecurityEvent(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  description: string,
  metadata: Record<string, any> = {}
): SecurityEvent {
  return {
    id: `evt_${generateRandomString(12)}`,
    timestamp: new Date(),
    eventType,
    severity,
    userId: metadata.userId,
    transactionId: metadata.transactionId,
    ipAddress: metadata.ipAddress || 'unknown',
    userAgent: metadata.userAgent || 'unknown',
    location: metadata.location,
    description,
    metadata,
    resolved: false,
    actions: []
  };
}

/**
 * Machine learning feature extraction for fraud detection
 */
export function extractMLFeatures(transactionData: any): number[] {
  const features: number[] = [];
  
  // Normalize transaction amount (log scale)
  features.push(Math.log10(Math.max(transactionData.amount, 1)));
  
  // Time-based features
  const hour = new Date(transactionData.timestamp).getHours();
  const dayOfWeek = new Date(transactionData.timestamp).getDay();
  features.push(hour / 24); // Normalized hour
  features.push(dayOfWeek / 7); // Normalized day of week
  
  // Boolean features (0 or 1)
  features.push(transactionData.isInternational ? 1 : 0);
  features.push(transactionData.isFirstTimeVendor ? 1 : 0);
  features.push(transactionData.isHighRiskCategory ? 1 : 0);
  features.push(transactionData.isKnownDevice ? 1 : 0);
  
  // Velocity features
  features.push(Math.min(transactionData.transactionsLast24h / 100, 1)); // Normalized
  features.push(Math.min(transactionData.amountLast24h / 100000, 1)); // Normalized
  
  // Device trust score
  features.push((transactionData.deviceTrustScore || 50) / 100);
  
  // Geographic features
  features.push(transactionData.distanceFromUsualLocation || 0);
  features.push(transactionData.isVPN ? 1 : 0);
  
  return features;
}

/**
 * Encryption utility for sensitive data (simple implementation)
 * Note: In production, use proper encryption libraries
 */
export function encryptSensitiveData(data: string, key: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
}

/**
 * Decryption utility for sensitive data (simple implementation)
 */
export function decryptSensitiveData(encryptedData: string, key: string): string {
  try {
    const decoded = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Generate security audit log entry
 */
export function generateAuditLog(
  action: string,
  userId: string,
  details: Record<string, any>
): {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  details: Record<string, any>;
  hash: string;
} {
  const id = generateSecureTransactionId();
  const timestamp = new Date();
  
  const logEntry = {
    id,
    timestamp,
    action,
    userId,
    details: {
      ...details,
      userAgent: details.userAgent || 'unknown',
      ipAddress: details.ipAddress || 'unknown'
    }
  };
  
  // Create integrity hash
  const logString = JSON.stringify(logEntry);
  const hash = hashSensitiveData(logString);
  
  return {
    ...logEntry,
    hash
  };
}

/**
 * Rate limiting implementation
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  getRemainingAttempts(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    const now = Date.now();
    const validAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Export rate limiter instances for common use cases
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const transactionRateLimiter = new RateLimiter(10, 60 * 1000); // 10 transactions per minute
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 API calls per minute

export default {
  generateSecureTransactionId,
  generateRandomString,
  hashSensitiveData,
  sanitizeInput,
  isHighRiskIP,
  detectVPNOrProxy,
  calculateDistance,
  detectImpossibleTravel,
  generateDeviceFingerprint,
  compareDeviceFingerprints,
  analyzeVelocityPattern,
  analyzeTimePatterns,
  assessTransactionRisk,
  createSecurityEvent,
  extractMLFeatures,
  encryptSensitiveData,
  decryptSensitiveData,
  generateAuditLog,
  RateLimiter,
  loginRateLimiter,
  transactionRateLimiter,
  apiRateLimiter,
  SECURITY_CONSTANTS
};