// Moderation rules and logic for the Review Response System
// Based on PRD requirements for automated and manual moderation

import { ResponseStatus } from '@/types/review-responses.types';

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoAction: ResponseStatus | 'flag' | 'none';
  keywords?: string[];
  patterns?: RegExp[];
  minScore?: number;
  maxScore?: number;
}

export interface ModerationResult {
  passed: boolean;
  violations: ModerationRule[];
  suggestedAction: ResponseStatus;
  confidence: number; // 0-100
  reasons: string[];
}

// Define moderation rules
export const MODERATION_RULES: ModerationRule[] = [
  {
    id: 'profanity',
    name: 'Profanity Detection',
    description: 'Detects profane or offensive language',
    severity: 'high',
    autoAction: 'rejected',
    keywords: [
      'fuck', 'shit', 'damn', 'hell', 'bitch', 'asshole', 'bastard',
      'crap', 'piss', 'bloody', 'freaking', 'fucking', 'shitty'
    ]
  },
  {
    id: 'harassment',
    name: 'Harassment Detection',
    description: 'Detects harassment or threatening language',
    severity: 'critical',
    autoAction: 'rejected',
    keywords: [
      'kill', 'die', 'threat', 'harm', 'hurt', 'attack', 'violence',
      'hate', 'despise', 'loathe', 'destroy', 'ruin', 'sabotage'
    ]
  },
  {
    id: 'spam',
    name: 'Spam Detection',
    description: 'Detects spam patterns and promotional content',
    severity: 'medium',
    autoAction: 'flagged',
    patterns: [
      /(.)\1{4,}/g, // Repeated characters
      /https?:\/\/[^\s]+/g, // URLs
      /[A-Z]{5,}/g, // Excessive caps
      /\$\$+/g, // Multiple dollar signs
      /!!!+/g // Multiple exclamation marks
    ]
  },
  {
    id: 'personal_info',
    name: 'Personal Information',
    description: 'Detects sharing of personal contact information',
    severity: 'high',
    autoAction: 'flagged',
    patterns: [
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
      /\b\d{5}(-\d{4})?\b/g, // ZIP codes
      /(skype|discord|telegram|whatsapp):\s*[^\s]+/gi // Communication platforms
    ]
  },
  {
    id: 'quality_minimum',
    name: 'Minimum Quality Standards',
    description: 'Ensures responses meet minimum quality standards',
    severity: 'medium',
    autoAction: 'flagged',
    minScore: 30
  },
  {
    id: 'length_requirements',
    name: 'Length Requirements',
    description: 'Checks response length requirements',
    severity: 'low',
    autoAction: 'none',
    minScore: 10,
    maxScore: 2000
  },
  {
    id: 'professional_tone',
    name: 'Professional Tone',
    description: 'Ensures professional and constructive tone',
    severity: 'medium',
    autoAction: 'flagged',
    keywords: [
      'unprofessional', 'rude', 'disrespectful', 'inappropriate',
      'stupid', 'idiot', 'moron', 'dumb', 'pathetic'
    ]
  },
  {
    id: 'relevance',
    name: 'Content Relevance',
    description: 'Ensures response is relevant to the review',
    severity: 'low',
    autoAction: 'none',
    keywords: [
      'project', 'work', 'experience', 'communication', 'quality',
      'delivery', 'timeline', 'feedback', 'improvement'
    ]
  }
];

/**
 * Analyze response content for moderation violations
 */
export const analyzeResponseContent = (content: string): ModerationResult => {
  const violations: ModerationRule[] = [];
  const reasons: string[] = [];
  let confidence = 100;
  
  // Check each rule
  MODERATION_RULES.forEach(rule => {
    let violated = false;
    let reason = '';
    
    // Check keywords
    if (rule.keywords) {
      const lowerContent = content.toLowerCase();
      const foundKeywords = rule.keywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        violated = true;
        reason = `Contains ${rule.name.toLowerCase()}: ${foundKeywords.join(', ')}`;
      }
    }
    
    // Check patterns
    if (rule.patterns) {
      const foundPatterns = rule.patterns.filter(pattern => pattern.test(content));
      
      if (foundPatterns.length > 0) {
        violated = true;
        reason = `Matches ${rule.name.toLowerCase()} patterns`;
      }
    }
    
    // Check quality score
    if (rule.minScore !== undefined || rule.maxScore !== undefined) {
      const qualityScore = calculateQualityScore(content);
      
      if (rule.minScore !== undefined && qualityScore < rule.minScore) {
        violated = true;
        reason = `Quality score ${qualityScore} below minimum ${rule.minScore}`;
      }
      
      if (rule.maxScore !== undefined && qualityScore > rule.maxScore) {
        violated = true;
        reason = `Quality score ${qualityScore} above maximum ${rule.maxScore}`;
      }
    }
    
    if (violated) {
      violations.push(rule);
      reasons.push(reason);
      
      // Reduce confidence based on severity
      switch (rule.severity) {
        case 'critical':
          confidence -= 30;
          break;
        case 'high':
          confidence -= 20;
          break;
        case 'medium':
          confidence -= 10;
          break;
        case 'low':
          confidence -= 5;
          break;
      }
    }
  });
  
  // Determine suggested action
  let suggestedAction: ResponseStatus = 'approved';
  
  if (violations.length > 0) {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const highViolations = violations.filter(v => v.severity === 'high');
    const mediumViolations = violations.filter(v => v.severity === 'medium');
    
    if (criticalViolations.length > 0) {
      suggestedAction = 'rejected';
    } else if (highViolations.length > 0) {
      suggestedAction = 'rejected';
    } else if (mediumViolations.length > 0) {
      suggestedAction = 'flagged';
    } else {
      suggestedAction = 'approved';
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
    suggestedAction,
    confidence: Math.max(0, confidence),
    reasons
  };
};

/**
 * Calculate quality score for moderation
 */
const calculateQualityScore = (content: string): number => {
  let score = 50; // Base score
  
  // Length scoring
  const length = content.length;
  if (length >= 50 && length <= 500) {
    score += 20; // Optimal length
  } else if (length >= 10 && length < 50) {
    score += 10; // Acceptable but short
  } else if (length > 500 && length <= 2000) {
    score += 5; // Acceptable but long
  } else if (length < 10) {
    score -= 30; // Too short
  } else {
    score -= 20; // Too long
  }
  
  // Professional language scoring
  const professionalWords = ['thank', 'appreciate', 'professional', 'improve', 'feedback'];
  const unprofessionalWords = ['hate', 'stupid', 'idiot', 'suck', 'terrible'];
  
  const lowerContent = content.toLowerCase();
  professionalWords.forEach(word => {
    if (lowerContent.includes(word)) score += 8;
  });
  
  unprofessionalWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 20;
  });
  
  // Gratitude scoring
  if (lowerContent.includes('thank') || lowerContent.includes('appreciate')) {
    score += 10;
  }
  
  // Specificity scoring
  const specificWords = ['project', 'work', 'experience', 'communication', 'quality'];
  const specificMatches = specificWords.filter(word => lowerContent.includes(word)).length;
  score += Math.min(specificMatches * 5, 20);
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Get moderation action explanation
 */
export const getModerationExplanation = (result: ModerationResult): string => {
  if (result.passed) {
    return 'Response passed all moderation checks and can be approved.';
  }
  
  const explanations: string[] = [];
  
  result.violations.forEach(violation => {
    switch (violation.severity) {
      case 'critical':
        explanations.push(`Critical violation: ${violation.description}`);
        break;
      case 'high':
        explanations.push(`High severity: ${violation.description}`);
        break;
      case 'medium':
        explanations.push(`Medium severity: ${violation.description}`);
        break;
      case 'low':
        explanations.push(`Low severity: ${violation.description}`);
        break;
    }
  });
  
  return explanations.join(' ');
};

/**
 * Check if response should be auto-approved
 */
export const shouldAutoApprove = (result: ModerationResult): boolean => {
  return result.passed && result.confidence >= 80;
};

/**
 * Check if response should be auto-rejected
 */
export const shouldAutoReject = (result: ModerationResult): boolean => {
  const criticalViolations = result.violations.filter(v => v.severity === 'critical');
  const highViolations = result.violations.filter(v => v.severity === 'high');
  
  return criticalViolations.length > 0 || highViolations.length > 0;
};

/**
 * Get moderation priority
 */
export const getModerationPriority = (result: ModerationResult): 'low' | 'medium' | 'high' | 'urgent' => {
  const criticalViolations = result.violations.filter(v => v.severity === 'critical');
  const highViolations = result.violations.filter(v => v.severity === 'high');
  const mediumViolations = result.violations.filter(v => v.severity === 'medium');
  
  if (criticalViolations.length > 0) {
    return 'urgent';
  } else if (highViolations.length > 0) {
    return 'high';
  } else if (mediumViolations.length > 0) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Generate moderation notes
 */
export const generateModerationNotes = (result: ModerationResult): string => {
  if (result.passed) {
    return 'Response passed automated moderation checks.';
  }
  
  const notes: string[] = [];
  
  result.violations.forEach(violation => {
    notes.push(`${violation.name}: ${violation.description}`);
  });
  
  notes.push(`Confidence: ${result.confidence}%`);
  notes.push(`Suggested action: ${result.suggestedAction}`);
  
  return notes.join('\n');
};

/**
 * Check for duplicate responses
 */
export const checkForDuplicates = (
  content: string, 
  existingResponses: string[]
): { isDuplicate: boolean; similarity: number } => {
  const similarity = existingResponses.map(existing => 
    calculateSimilarity(content.toLowerCase(), existing.toLowerCase())
  );
  
  const maxSimilarity = Math.max(...similarity);
  
  return {
    isDuplicate: maxSimilarity > 0.8,
    similarity: maxSimilarity
  };
};

/**
 * Calculate text similarity using simple algorithm
 */
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Get moderation statistics
 */
export const getModerationStats = (results: ModerationResult[]) => {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  const autoApproved = results.filter(r => shouldAutoApprove(r)).length;
  const autoRejected = results.filter(r => shouldAutoReject(r)).length;
  const needsReview = total - autoApproved - autoRejected;
  
  const avgConfidence = total > 0 
    ? results.reduce((sum, r) => sum + r.confidence, 0) / total 
    : 0;
  
  return {
    total,
    passed,
    failed,
    autoApproved,
    autoRejected,
    needsReview,
    avgConfidence,
    passRate: total > 0 ? (passed / total) * 100 : 0
  };
};
