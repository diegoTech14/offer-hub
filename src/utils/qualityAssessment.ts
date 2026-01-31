// Quality assessment utilities for the Review Response System
// Based on PRD requirements for response quality scoring and improvement suggestions

// import { ResponseQualityAssessment } from '@/types/review-responses.types';

export interface QualityFactor {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  description: string;
}

export interface QualityMetrics {
  overallScore: number;
  factors: QualityFactor[];
  suggestions: string[];
  autoApprove: boolean;
  needsReview: boolean;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Comprehensive quality assessment for response content
 */
export const assessResponseQuality = (content: string): QualityMetrics => {
  const factors: QualityFactor[] = [
    assessLengthQuality(content),
    assessProfessionalismQuality(content),
    assessRelevanceQuality(content),
    assessToneQuality(content),
    assessClarityQuality(content),
    assessGratitudeQuality(content),
    assessSpecificityQuality(content)
  ];
  
  // Calculate weighted overall score
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedScore = factors.reduce((sum, factor) => 
    sum + (factor.score * factor.weight), 0
  );
  
  const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
  
  // Generate suggestions
  const suggestions = generateQualitySuggestions(factors, overallScore);
  
  // Determine auto-approval and review needs
  const autoApprove = overallScore >= 80 && factors.every(f => f.score >= 70);
  const needsReview = overallScore < 60 || factors.some(f => f.score < 50);
  
  // Determine priority
  const priority = determinePriority(overallScore, factors);
  
  return {
    overallScore,
    factors,
    suggestions,
    autoApprove,
    needsReview,
    priority
  };
};

/**
 * Assess length quality
 */
const assessLengthQuality = (content: string): QualityFactor => {
  const length = content.length;
  let score = 0;
  let description = '';
  
  if (length >= 50 && length <= 500) {
    score = 100;
    description = 'Optimal length for engagement';
  } else if (length >= 30 && length < 50) {
    score = 70;
    description = 'Acceptable but could be more detailed';
  } else if (length > 500 && length <= 1000) {
    score = 80;
    description = 'Detailed but may be too long';
  } else if (length > 1000 && length <= 2000) {
    score = 60;
    description = 'Very detailed but quite long';
  } else if (length < 30) {
    score = 30;
    description = 'Too short for meaningful response';
  } else {
    score = 20;
    description = 'Exceeds maximum recommended length';
  }
  
  return {
    name: 'Length',
    weight: 15,
    score,
    maxScore: 100,
    description
  };
};

/**
 * Assess professionalism quality
 */
const assessProfessionalismQuality = (content: string): QualityFactor => {
  const lowerContent = content.toLowerCase();
  
  // Professional indicators
  const professionalWords = [
    'thank', 'appreciate', 'professional', 'improve', 'feedback',
    'understand', 'clarify', 'collaborate', 'enhance', 'develop'
  ];
  
  // Unprofessional indicators
  const unprofessionalWords = [
    'hate', 'stupid', 'idiot', 'suck', 'terrible', 'awful',
    'pathetic', 'ridiculous', 'nonsense', 'bullshit'
  ];
  
  let score = 50; // Base score
  
  // Count professional words
  const professionalCount = professionalWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  score += Math.min(professionalCount * 8, 30);
  
  // Count unprofessional words
  const unprofessionalCount = unprofessionalWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  score -= unprofessionalCount * 15;
  
  // Check for proper capitalization
  if (content.charAt(0) === content.charAt(0).toUpperCase()) {
    score += 5;
  }
  
  // Check for proper punctuation
  if (content.endsWith('.') || content.endsWith('!') || content.endsWith('?')) {
    score += 5;
  }
  
  const description = score >= 80 ? 'Highly professional tone' :
                    score >= 60 ? 'Professional tone with minor issues' :
                    score >= 40 ? 'Somewhat professional but needs improvement' :
                    'Unprofessional tone detected';
  
  return {
    name: 'Professionalism',
    weight: 25,
    score: Math.max(0, Math.min(100, score)),
    maxScore: 100,
    description
  };
};

/**
 * Assess relevance quality
 */
const assessRelevanceQuality = (content: string): QualityFactor => {
  const lowerContent = content.toLowerCase();
  
  // Relevance keywords
  const relevanceKeywords = [
    'project', 'work', 'experience', 'communication', 'quality',
    'delivery', 'timeline', 'feedback', 'improvement', 'service',
    'collaboration', 'expectations', 'requirements', 'outcome'
  ];
  
  const foundKeywords = relevanceKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  const score = Math.min(foundKeywords.length * 12, 100);
  
  const description = score >= 80 ? 'Highly relevant to review context' :
                    score >= 60 ? 'Mostly relevant with good context' :
                    score >= 40 ? 'Somewhat relevant but could be more specific' :
                    'Limited relevance to review content';
  
  return {
    name: 'Relevance',
    weight: 20,
    score,
    maxScore: 100,
    description
  };
};

/**
 * Assess tone quality
 */
const assessToneQuality = (content: string): QualityFactor => {
  const lowerContent = content.toLowerCase();
  
  // Positive tone indicators
  const positiveWords = [
    'thank', 'appreciate', 'positive', 'good', 'great', 'excellent',
    'improve', 'better', 'enhance', 'pleased', 'satisfied', 'happy'
  ];
  
  // Negative tone indicators
  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated',
    'angry', 'upset', 'annoyed', 'disgusted', 'horrible'
  ];
  
  let score = 50; // Base score
  
  // Count positive words
  const positiveCount = positiveWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  score += Math.min(positiveCount * 6, 30);
  
  // Count negative words
  const negativeCount = negativeWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  score -= negativeCount * 10;
  
  // Check for constructive language
  const constructiveWords = ['improve', 'enhance', 'develop', 'better', 'progress'];
  const constructiveCount = constructiveWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  score += constructiveCount * 5;
  
  const description = score >= 80 ? 'Very positive and constructive tone' :
                    score >= 60 ? 'Positive tone with constructive elements' :
                    score >= 40 ? 'Neutral tone, could be more positive' :
                    'Negative or defensive tone detected';
  
  return {
    name: 'Tone',
    weight: 20,
    score: Math.max(0, Math.min(100, score)),
    maxScore: 100,
    description
  };
};

/**
 * Assess clarity quality
 */
const assessClarityQuality = (content: string): QualityFactor => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  let score = 50; // Base score
  
  // Sentence length analysis
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  
  if (avgSentenceLength >= 8 && avgSentenceLength <= 20) {
    score += 20; // Optimal sentence length
  } else if (avgSentenceLength >= 5 && avgSentenceLength < 8) {
    score += 10; // Short but acceptable
  } else if (avgSentenceLength > 20) {
    score -= 10; // Too long
  } else {
    score -= 5; // Too short
  }
  
  // Word complexity analysis
  const complexWords = words.filter(word => word.length > 6);
  const complexityRatio = words.length > 0 ? complexWords.length / words.length : 0;
  
  if (complexityRatio >= 0.1 && complexityRatio <= 0.3) {
    score += 15; // Good complexity balance
  } else if (complexityRatio < 0.1) {
    score += 5; // Simple but clear
  } else {
    score -= 10; // Too complex
  }
  
  // Check for proper structure
  if (content.includes(',') || content.includes(';')) {
    score += 10; // Good use of punctuation
  }
  
  const description = score >= 80 ? 'Very clear and well-structured' :
                    score >= 60 ? 'Clear with good structure' :
                    score >= 40 ? 'Somewhat clear but could be improved' :
                    'Unclear or poorly structured';
  
  return {
    name: 'Clarity',
    weight: 10,
    score: Math.max(0, Math.min(100, score)),
    maxScore: 100,
    description
  };
};

/**
 * Assess gratitude quality
 */
const assessGratitudeQuality = (content: string): QualityFactor => {
  const lowerContent = content.toLowerCase();
  
  const gratitudeWords = [
    'thank', 'thanks', 'appreciate', 'grateful', 'appreciation',
    'acknowledge', 'recognize', 'value'
  ];
  
  const gratitudeCount = gratitudeWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  
  const score = Math.min(gratitudeCount * 25, 100);
  
  const description = score >= 80 ? 'Excellent gratitude expression' :
                    score >= 60 ? 'Good gratitude expression' :
                    score >= 40 ? 'Some gratitude expressed' :
                    'Limited gratitude expression';
  
  return {
    name: 'Gratitude',
    weight: 10,
    score,
    maxScore: 100,
    description
  };
};

/**
 * Assess specificity quality
 */
const assessSpecificityQuality = (content: string): QualityFactor => {
  const lowerContent = content.toLowerCase();
  
  // Specificity indicators
  const specificWords = [
    'specifically', 'particular', 'exactly', 'precisely', 'detailed',
    'specific', 'concrete', 'particular', 'exact'
  ];
  
  // Action-oriented words
  const actionWords = [
    'will', 'shall', 'plan', 'intend', 'commit', 'promise',
    'ensure', 'guarantee', 'improve', 'enhance', 'develop'
  ];
  
  const specificCount = specificWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  
  const actionCount = actionWords.filter(word => 
    lowerContent.includes(word)
  ).length;
  
  const score = Math.min((specificCount * 15) + (actionCount * 10), 100);
  
  const description = score >= 80 ? 'Highly specific and actionable' :
                    score >= 60 ? 'Good specificity with clear actions' :
                    score >= 40 ? 'Somewhat specific but could be clearer' :
                    'Vague or non-specific content';
  
  return {
    name: 'Specificity',
    weight: 10,
    score,
    maxScore: 100,
    description
  };
};

/**
 * Generate quality improvement suggestions
 */
const generateQualitySuggestions = (factors: QualityFactor[], overallScore: number): string[] => {
  const suggestions: string[] = [];
  
  factors.forEach(factor => {
    if (factor.score < 60) {
      switch (factor.name) {
        case 'Length':
          if (factor.score < 50) {
            suggestions.push('Consider adding more detail to make your response more helpful');
          } else {
            suggestions.push('Consider shortening your response for better readability');
          }
          break;
        case 'Professionalism':
          suggestions.push('Use more professional language and avoid informal expressions');
          break;
        case 'Relevance':
          suggestions.push('Address specific points mentioned in the review');
          break;
        case 'Tone':
          suggestions.push('Maintain a positive and constructive tone throughout');
          break;
        case 'Clarity':
          suggestions.push('Improve sentence structure and clarity of expression');
          break;
        case 'Gratitude':
          suggestions.push('Express gratitude for the reviewer\'s feedback');
          break;
        case 'Specificity':
          suggestions.push('Be more specific about improvements and actions');
          break;
      }
    }
  });
  
  // Overall suggestions
  if (overallScore < 70) {
    suggestions.push('Consider reviewing response guidelines for best practices');
  }
  
  if (overallScore >= 80) {
    suggestions.push('Excellent response quality! Keep up the great work.');
  }
  
  return suggestions;
};

/**
 * Determine review priority
 */
const determinePriority = (overallScore: number, factors: QualityFactor[]): 'low' | 'medium' | 'high' => {
  const lowScores = factors.filter(f => f.score < 50).length;
  const criticalFactors = factors.filter(f => f.weight >= 20 && f.score < 60).length;
  
  if (overallScore < 40 || lowScores >= 3 || criticalFactors >= 2) {
    return 'high';
  } else if (overallScore < 60 || lowScores >= 1 || criticalFactors >= 1) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Get quality grade
 */
export const getQualityGrade = (score: number): { grade: string; color: string } => {
  if (score >= 90) {
    return { grade: 'A+', color: 'text-green-600' };
  } else if (score >= 80) {
    return { grade: 'A', color: 'text-green-600' };
  } else if (score >= 70) {
    return { grade: 'B', color: 'text-blue-600' };
  } else if (score >= 60) {
    return { grade: 'C', color: 'text-yellow-600' };
  } else if (score >= 50) {
    return { grade: 'D', color: 'text-orange-600' };
  } else {
    return { grade: 'F', color: 'text-red-600' };
  }
};

/**
 * Compare quality scores
 */
export const compareQualityScores = (score1: number, score2: number): string => {
  const diff = score1 - score2;
  
  if (Math.abs(diff) < 5) {
    return 'Similar quality';
  } else if (diff > 0) {
    return `${diff.toFixed(1)} points better`;
  } else {
    return `${Math.abs(diff).toFixed(1)} points worse`;
  }
};

/**
 * Get quality trend
 */
export const getQualityTrend = (scores: number[]): 'improving' | 'declining' | 'stable' => {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(-3);
  const older = scores.slice(0, -3);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
};
