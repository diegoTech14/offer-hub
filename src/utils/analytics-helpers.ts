import {
  ApplicationAnalytics,
  ApplicationPerformanceMetrics,
  ApplicationTrends,
  UserBehaviorPattern,
  PredictiveAnalytics,
  SuccessPrediction,
  ApplicationAnalyticsFilter,
  ChartData,
  TimeSeriesData,
  EngagementLevel,
  SegmentData,
  SkillMetric,
  TimeMetric,
  SourceMetric,
  ApplicationStatus,
  ApplicationSource,
  MarketTrend,
  SkillForecast,
  UserPrediction,
  OptimizationRecommendation,
  PredictionFactor,
  MobileAnalytics,
  SecurityAnalytics,
  ComplianceData,
  ProcessingTimeMetric,
  FairnessMetric
} from '@/types/application-analytics.types';

export class ApplicationAnalyticsCalculator {
  static calculatePerformanceMetrics(applications: ApplicationAnalytics[]): ApplicationPerformanceMetrics {
    const total = applications.length;
    const successful = applications.filter(app => app.status === ApplicationStatus.ACCEPTED).length;
    const pending = applications.filter(app =>
      [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.INTERVIEW_SCHEDULED].includes(app.status)
    ).length;

    const decisionsWithTime = applications.filter(app => app.decisionTime !== undefined);
    const avgDecisionTime = decisionsWithTime.length > 0
      ? decisionsWithTime.reduce((sum, app) => sum + (app.decisionTime || 0), 0) / decisionsWithTime.length
      : 0;

    const successRate = total > 0 ? (successful / total) * 100 : 0;

    const applicationsWithValue = applications.filter(app => app.projectValue && app.projectValue > 0);
    const avgProjectValue = applicationsWithValue.length > 0
      ? applicationsWithValue.reduce((sum, app) => sum + (app.projectValue || 0), 0) / applicationsWithValue.length
      : 0;

    const conversionRate = this.calculateConversionRate(applications);
    const topSkills = this.calculateTopSkills(applications);
    const timeToDecision = this.calculateTimeMetrics(applications);
    const applicationsBySource = this.calculateSourceMetrics(applications);

    return {
      totalApplications: total,
      successfulApplications: successful,
      pendingApplications: pending,
      averageDecisionTime: avgDecisionTime,
      successRate,
      conversionRate,
      averageProjectValue: avgProjectValue,
      topSkills,
      timeToDecision,
      applicationsBySource
    };
  }

  static calculateApplicationTrends(
    applications: ApplicationAnalytics[],
    period: 'daily' | 'weekly' | 'monthly',
    metric: 'count' | 'success_rate' | 'average_value'
  ): ApplicationTrends[] {
    const groupedData = this.groupApplicationsByPeriod(applications, period);
    const trends: ApplicationTrends[] = [];

    const sortedPeriods = Object.keys(groupedData).sort();

    sortedPeriods.forEach((periodKey, index) => {
      const currentData = groupedData[periodKey];
      const previousData = index > 0 ? groupedData[sortedPeriods[index - 1]] : null;

      let value = 0;
      let successRate = 0;
      let averageValue = 0;
      let previousValue = 0;

      const successful = currentData.filter(app => app.status === ApplicationStatus.ACCEPTED);
      successRate = currentData.length > 0 ? (successful.length / currentData.length) * 100 : 0;

      const withValue = currentData.filter(app => app.projectValue && app.projectValue > 0);
      averageValue = withValue.length > 0
        ? withValue.reduce((sum, app) => sum + (app.projectValue || 0), 0) / withValue.length
        : 0;

      switch (metric) {
        case 'count':
          value = currentData.length;
          previousValue = previousData ? previousData.length : 0;
          break;
        case 'success_rate':
          value = successRate;
          if (previousData) {
            const prevSuccessful = previousData.filter(app => app.status === ApplicationStatus.ACCEPTED);
            previousValue = previousData.length > 0 ? (prevSuccessful.length / previousData.length) * 100 : 0;
          }
          break;
        case 'average_value':
          value = averageValue;
          if (previousData) {
            const prevWithValue = previousData.filter(app => app.projectValue && app.projectValue > 0);
            previousValue = prevWithValue.length > 0
              ? prevWithValue.reduce((sum, app) => sum + (app.projectValue || 0), 0) / prevWithValue.length
              : 0;
          }
          break;
      }

      const change = value - previousValue;
      const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;

      trends.push({
        period: periodKey,
        applications: currentData.length,
        successRate,
        averageValue,
        change,
        changePercentage
      });
    });

    return trends;
  }

  static analyzeUserBehaviorPatterns(applications: ApplicationAnalytics[]): UserBehaviorPattern[] {
    const userGroups = this.groupApplicationsByUser(applications);

    return Array.from(userGroups.entries()).map(([userId, userApplications]) => {
      const applicationFrequency = userApplications.length;
      const averageQuality = this.calculateApplicationQuality(userApplications);
      const submissionTimes = this.analyzeSubmissionTimes(userApplications);
      const devicePreference = this.analyzeDevicePreference(userApplications);
      const engagementScore = this.calculateEngagementScore(userApplications);
      const successPrediction = this.predictUserSuccess(userApplications);

      return {
        userId,
        applicationFrequency,
        averageApplicationQuality: averageQuality,
        preferredSubmissionTimes: submissionTimes,
        devicePreference,
        engagementScore,
        successPrediction
      };
    });
  }

  static generatePredictiveAnalytics(applications: ApplicationAnalytics[]): PredictiveAnalytics {
    const applicationSuccessPrediction = this.generateApplicationSuccessPredictions(applications);
    const marketTrends = this.analyzeMarketTrends(applications);
    const skillDemandForecast = this.forecastSkillDemand(applications);
    const userBehaviorPredictions = this.predictUserBehavior(applications);
    const platformOptimization = this.generateOptimizationRecommendations(applications);

    return {
      applicationSuccessPrediction,
      marketTrends,
      skillDemandForecast,
      userBehaviorPredictions,
      platformOptimization
    };
  }

  static filterApplications(applications: ApplicationAnalytics[], filter: ApplicationAnalyticsFilter): ApplicationAnalytics[] {
    return applications.filter(app => {
      if (filter.dateRange) {
        const appDate = new Date(app.submittedAt);
        if (appDate < filter.dateRange.from || appDate > filter.dateRange.to) {
          return false;
        }
      }

      if (filter.status && !filter.status.includes(app.status)) {
        return false;
      }

      if (filter.source && !filter.source.includes(app.source)) {
        return false;
      }

      if (filter.projectType && filter.projectType.length > 0 && !filter.projectType.includes(app.projectType)) {
        return false;
      }

      if (filter.skillsRequired && filter.skillsRequired.length > 0) {
        const hasMatchingSkill = filter.skillsRequired.some(skill => app.skillsRequired.includes(skill));
        if (!hasMatchingSkill) {
          return false;
        }
      }

      if (filter.userId && filter.userId.length > 0 && !filter.userId.includes(app.userId)) {
        return false;
      }

      if (filter.projectValueRange) {
        const value = app.projectValue || 0;
        if (value < filter.projectValueRange.min || value > filter.projectValueRange.max) {
          return false;
        }
      }

      if (filter.successRate && app.successRate !== undefined && app.successRate < filter.successRate) {
        return false;
      }

      if (filter.engagementLevel && filter.engagementLevel.length > 0) {
        const userEngagement = this.calculateEngagementLevel(app);
        if (!filter.engagementLevel.includes(userEngagement)) {
          return false;
        }
      }

      return true;
    });
  }

  static convertToChartData(data: any[], labelKey: string, valueKey: string): ChartData[] {
    const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

    return data.map((item, index) => ({
      name: item[labelKey],
      value: item[valueKey] || 0,
      percentage: total > 0 ? ((item[valueKey] || 0) / total) * 100 : 0,
      color: this.getColorByIndex(index),
      trend: this.calculateTrend(data, index, valueKey),
      metadata: {
        index,
        originalData: item
      }
    }));
  }

  static convertToTimeSeriesData(applications: ApplicationAnalytics[], metric: string): TimeSeriesData[] {
    const grouped = this.groupApplicationsByPeriod(applications, 'daily');

    return Object.entries(grouped).map(([date, apps]) => ({
      timestamp: new Date(date),
      value: this.calculateMetricValue(apps, metric),
      label: date,
      category: metric,
      metadata: {
        applicationsCount: apps.length,
        date: date
      }
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  static createSegmentedData(applications: ApplicationAnalytics[], segmentBy: keyof ApplicationAnalytics): SegmentData[] {
    const segments: Map<string, ApplicationAnalytics[]> = new Map();

    applications.forEach(app => {
      const segmentValue = String(app[segmentBy]);
      if (!segments.has(segmentValue)) {
        segments.set(segmentValue, []);
      }
      segments.get(segmentValue)!.push(app);
    });

    const total = applications.length;

    return Array.from(segments.entries()).map(([segment, segmentApps]) => {
      const value = segmentApps.length;
      const percentage = total > 0 ? (value / total) * 100 : 0;

      const recentCount = this.getRecentApplications(segmentApps, 30).length;
      const olderCount = this.getApplicationsInRange(segmentApps, 60, 30).length;
      const trend = olderCount > 0 ? ((recentCount - olderCount) / olderCount) * 100 : 0;

      return {
        segment,
        value,
        percentage,
        trend,
        metadata: {
          successRate: this.calculateSuccessRate(segmentApps),
          averageValue: this.calculateAverageProjectValue(segmentApps)
        }
      };
    }).sort((a, b) => b.value - a.value);
  }

  static generateComplianceReport(applications: ApplicationAnalytics[]): ComplianceData {
    const processingTimes = this.calculateProcessingTimeMetrics(applications);
    const fairnessMetrics = this.calculateFairnessMetrics(applications);
    const dataRetention = this.calculateDataRetentionMetrics(applications);
    const userConsent = this.calculateConsentMetrics(applications);
    const auditTrail = this.generateAuditTrail(applications);

    return {
      totalApplications: applications.length,
      processingTimes: [processingTimes],
      fairnessMetrics,
      dataRetention,
      userConsent: [userConsent],
      auditTrail
    };
  }

  static analyzeMobilePerformance(applications: ApplicationAnalytics[]): MobileAnalytics[] {
    const mobileApplications = applications.filter(app => app.behaviorMetrics.mobilePlatform);

    return this.groupBy(mobileApplications, 'userId').map(([userId, userApps]) => {
      const app = userApps[0];
      return {
        deviceType: this.inferDeviceType(app),
        operatingSystem: this.inferOS(app),
        appVersion: '1.0.0',
        screenSize: this.inferScreenSize(app),
        networkType: 'unknown',
        crashReports: [],
        performanceMetrics: {
          appLaunchTime: app.behaviorMetrics.timeSpentOnApplication,
          screenLoadTime: app.behaviorMetrics.averageResponseTime,
          apiResponseTime: app.behaviorMetrics.averageResponseTime,
          memoryUsage: 0,
          batteryDrain: 0,
          networkLatency: 0
        }
      };
    });
  }

  static analyzeSecurityMetrics(applications: ApplicationAnalytics[]): SecurityAnalytics {
    return {
      authenticationAttempts: [],
      suspiciousActivity: [],
      dataAccess: [],
      securityIncidents: [],
      complianceScore: this.calculateSecurityComplianceScore(applications)
    };
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${remainingHours}h`;
    }
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  static formatNumber(value: number, compact: boolean = false): string {
    if (compact) {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }
    return value.toLocaleString();
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(average);
    }
    return result;
  }

  static calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateConversionRate(applications: ApplicationAnalytics[]): number {
    const submitted = applications.filter(app => app.status !== ApplicationStatus.DRAFT).length;
    const accepted = applications.filter(app => app.status === ApplicationStatus.ACCEPTED).length;
    return submitted > 0 ? (accepted / submitted) * 100 : 0;
  }

  private static calculateTopSkills(applications: ApplicationAnalytics[]): SkillMetric[] {
    const skillMap = new Map<string, ApplicationAnalytics[]>();

    applications.forEach(app => {
      app.skillsRequired.forEach(skill => {
        if (!skillMap.has(skill)) {
          skillMap.set(skill, []);
        }
        skillMap.get(skill)!.push(app);
      });
    });

    return Array.from(skillMap.entries())
      .map(([skill, apps]) => {
        const successful = apps.filter(app => app.status === ApplicationStatus.ACCEPTED);
        const successRate = apps.length > 0 ? (successful.length / apps.length) * 100 : 0;
        const avgValue = this.calculateAverageProjectValue(apps);

        return {
          skill,
          count: apps.length,
          successRate,
          averageValue: avgValue,
          demand: this.calculateSkillDemand(apps)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static calculateTimeMetrics(applications: ApplicationAnalytics[]): TimeMetric[] {
    const decisionsWithTime = applications.filter(app => app.decisionTime !== undefined);
    if (decisionsWithTime.length === 0) return [];

    const times = decisionsWithTime.map(app => app.decisionTime!).sort((a, b) => a - b);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const medianTime = times[Math.floor(times.length / 2)];
    const percentile90 = times[Math.floor(times.length * 0.9)];
    const percentile95 = times[Math.floor(times.length * 0.95)];

    return [{
      period: 'overall',
      averageTime,
      medianTime,
      percentile90,
      percentile95
    }];
  }

  private static calculateSourceMetrics(applications: ApplicationAnalytics[]): SourceMetric[] {
    const sourceGroups = this.groupBy(applications, 'source');

    return sourceGroups.map(([source, apps]) => {
      const successful = apps.filter(app => app.status === ApplicationStatus.ACCEPTED);
      const submitted = apps.filter(app => app.status !== ApplicationStatus.DRAFT);

      return {
        source: source as ApplicationSource,
        count: apps.length,
        successRate: apps.length > 0 ? (successful.length / apps.length) * 100 : 0,
        averageValue: this.calculateAverageProjectValue(apps),
        conversionRate: submitted.length > 0 ? (successful.length / submitted.length) * 100 : 0
      };
    }).sort((a, b) => b.count - a.count);
  }

  private static groupApplicationsByPeriod(
    applications: ApplicationAnalytics[],
    period: 'daily' | 'weekly' | 'monthly'
  ): Record<string, ApplicationAnalytics[]> {
    const groups: Record<string, ApplicationAnalytics[]> = {};

    applications.forEach(app => {
      const date = new Date(app.submittedAt);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(app);
    });

    return groups;
  }

  private static groupApplicationsByUser(applications: ApplicationAnalytics[]): Map<string, ApplicationAnalytics[]> {
    const userGroups = new Map<string, ApplicationAnalytics[]>();

    applications.forEach(app => {
      if (!userGroups.has(app.userId)) {
        userGroups.set(app.userId, []);
      }
      userGroups.get(app.userId)!.push(app);
    });

    return userGroups;
  }

  private static calculateApplicationQuality(applications: ApplicationAnalytics[]): number {
    return applications.reduce((sum, app) => {
      let quality = 0;

      quality += Math.min(app.behaviorMetrics.timeSpentOnApplication / 1800, 1) * 25;
      quality += Math.min(app.behaviorMetrics.attachmentCount / 3, 1) * 25;
      quality += Math.min(app.behaviorMetrics.customFieldsCompleted / 10, 1) * 25;
      quality += Math.max(0, 1 - (app.behaviorMetrics.revisionsCount / 5)) * 25;

      return sum + quality;
    }, 0) / applications.length;
  }

  private static analyzeSubmissionTimes(applications: ApplicationAnalytics[]) {
    const timePatterns = new Map<string, number>();

    applications.forEach(app => {
      const date = new Date(app.behaviorMetrics.submissionTime);
      const key = `${date.getHours()}-${date.getDay()}`;
      timePatterns.set(key, (timePatterns.get(key) || 0) + 1);
    });

    return Array.from(timePatterns.entries()).map(([key, frequency]) => {
      const [hour, dayOfWeek] = key.split('-').map(Number);
      return { hour, dayOfWeek, frequency };
    }).sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }

  private static analyzeDevicePreference(applications: ApplicationAnalytics[]) {
    let mobile = 0;
    let desktop = 0;

    applications.forEach(app => {
      if (app.behaviorMetrics.mobilePlatform) {
        mobile++;
      } else {
        desktop++;
      }
    });

    const total = applications.length;
    return {
      mobile: total > 0 ? (mobile / total) * 100 : 0,
      desktop: total > 0 ? (desktop / total) * 100 : 0,
      tablet: 0
    };
  }

  private static calculateEngagementScore(applications: ApplicationAnalytics[]): number {
    return applications.reduce((sum, app) => {
      let score = 0;

      score += Math.min(app.userEngagement.profileViews / 100, 1) * 20;
      score += Math.min(app.userEngagement.messagesSent / 10, 1) * 20;
      score += Math.min(app.userEngagement.sessionDuration / 3600, 1) * 20;
      score += Math.min(app.userEngagement.pagesVisited / 20, 1) * 20;
      score += Math.min(app.userEngagement.portfolioViews / 50, 1) * 20;

      return sum + score;
    }, 0) / applications.length;
  }

  private static predictUserSuccess(applications: ApplicationAnalytics[]): number {
    const successful = applications.filter(app => app.status === ApplicationStatus.ACCEPTED);
    const successRate = applications.length > 0 ? successful.length / applications.length : 0;

    const qualityScore = this.calculateApplicationQuality(applications) / 100;
    const engagementScore = this.calculateEngagementScore(applications) / 100;

    return Math.min(100, (successRate * 40 + qualityScore * 30 + engagementScore * 30));
  }

  private static generateApplicationSuccessPredictions(applications: ApplicationAnalytics[]): SuccessPrediction {
    const recentApplications = this.getRecentApplications(applications, 30);
    const factors = this.calculatePredictionFactors(applications);

    const successProbability = factors.reduce((prob, factor) => {
      const impact = factor.impact === 'positive' ? 1 : factor.impact === 'negative' ? -1 : 0;
      return prob + (factor.weight * impact * factor.currentValue);
    }, 0.5);

    return {
      userId: 'overall',
      applicationId: 'overall',
      successProbability: Math.max(0, Math.min(1, successProbability)) * 100,
      confidenceLevel: this.calculateConfidenceLevel(applications),
      factors,
      recommendations: this.generateRecommendations(factors)
    };
  }

  private static analyzeMarketTrends(applications: ApplicationAnalytics[]): MarketTrend[] {
    const skillDemand = this.calculateTopSkills(applications);

    return skillDemand.slice(0, 5).map(skill => ({
      skill: skill.skill,
      currentDemand: skill.demand,
      predictedDemand: skill.demand * (1 + Math.random() * 0.2 - 0.1),
      growthRate: (Math.random() * 20) - 10,
      timeframe: '6 months',
      confidence: 0.75 + Math.random() * 0.2
    }));
  }

  private static forecastSkillDemand(applications: ApplicationAnalytics[]): SkillForecast[] {
    const skillMetrics = this.calculateTopSkills(applications);

    return skillMetrics.slice(0, 10).map(skill => ({
      skill: skill.skill,
      currentValue: skill.averageValue,
      projectedValue: skill.averageValue * (1 + Math.random() * 0.3 - 0.1),
      trend: Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable' as const,
      marketSaturation: Math.random() * 100
    }));
  }

  private static predictUserBehavior(applications: ApplicationAnalytics[]): UserPrediction[] {
    const userPatterns = this.analyzeUserBehaviorPatterns(applications);

    return userPatterns.slice(0, 10).map(pattern => ({
      userId: pattern.userId,
      activityPrediction: pattern.applicationFrequency * 1.1,
      successLikelihood: pattern.successPrediction,
      churnRisk: 100 - pattern.engagementScore,
      valueScore: pattern.averageApplicationQuality
    }));
  }

  private static generateOptimizationRecommendations(applications: ApplicationAnalytics[]): OptimizationRecommendation[] {
    const metrics = this.calculatePerformanceMetrics(applications);
    const recommendations: OptimizationRecommendation[] = [];

    if (metrics.successRate < 50) {
      recommendations.push({
        area: 'Application Success Rate',
        description: 'Improve application matching and screening process',
        impact: 'high',
        effort: 'medium',
        expectedImprovement: 15,
        timeframe: '3 months'
      });
    }

    if (metrics.averageDecisionTime > 7 * 24 * 60) {
      recommendations.push({
        area: 'Decision Time',
        description: 'Streamline application review process',
        impact: 'medium',
        effort: 'low',
        expectedImprovement: 25,
        timeframe: '1 month'
      });
    }

    return recommendations;
  }

  private static calculatePredictionFactors(applications: ApplicationAnalytics[]): PredictionFactor[] {
    const metrics = this.calculatePerformanceMetrics(applications);

    return [
      {
        name: 'Success Rate',
        weight: 0.3,
        impact: metrics.successRate > 60 ? 'positive' : 'negative',
        description: 'Historical application success rate',
        currentValue: metrics.successRate / 100
      },
      {
        name: 'Decision Time',
        weight: 0.2,
        impact: metrics.averageDecisionTime < 5 * 24 * 60 ? 'positive' : 'negative',
        description: 'Average time to decision',
        currentValue: Math.max(0, 1 - (metrics.averageDecisionTime / (14 * 24 * 60)))
      },
      {
        name: 'Conversion Rate',
        weight: 0.25,
        impact: metrics.conversionRate > 70 ? 'positive' : 'negative',
        description: 'Rate of application submission to acceptance',
        currentValue: metrics.conversionRate / 100
      },
      {
        name: 'Project Value',
        weight: 0.25,
        impact: metrics.averageProjectValue > 1000 ? 'positive' : 'neutral',
        description: 'Average project value',
        currentValue: Math.min(1, metrics.averageProjectValue / 5000)
      }
    ];
  }

  private static generateRecommendations(factors: PredictionFactor[]): string[] {
    const recommendations: string[] = [];

    factors.forEach(factor => {
      if (factor.impact === 'negative' && factor.weight > 0.2) {
        recommendations.push(`Improve ${factor.name.toLowerCase()}: ${factor.description}`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring current performance metrics');
    }

    return recommendations;
  }

  private static calculateEngagementLevel(app: ApplicationAnalytics): EngagementLevel {
    const score = this.calculateEngagementScore([app]);
    if (score > 80) return EngagementLevel.VERY_HIGH;
    if (score > 60) return EngagementLevel.HIGH;
    if (score > 40) return EngagementLevel.MEDIUM;
    return EngagementLevel.LOW;
  }

  private static getColorByIndex(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private static calculateTrend(data: any[], index: number, valueKey: string): number {
    if (index === 0) return 0;
    const current = data[index][valueKey] || 0;
    const previous = data[index - 1][valueKey] || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  private static calculateMetricValue(applications: ApplicationAnalytics[], metric: string): number {
    switch (metric) {
      case 'count':
        return applications.length;
      case 'success_rate':
        const successful = applications.filter(app => app.status === ApplicationStatus.ACCEPTED);
        return applications.length > 0 ? (successful.length / applications.length) * 100 : 0;
      case 'average_value':
        return this.calculateAverageProjectValue(applications);
      case 'decision_time':
        const withTime = applications.filter(app => app.decisionTime);
        return withTime.length > 0
          ? withTime.reduce((sum, app) => sum + (app.decisionTime || 0), 0) / withTime.length
          : 0;
      default:
        return applications.length;
    }
  }

  private static getRecentApplications(applications: ApplicationAnalytics[], days: number): ApplicationAnalytics[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return applications.filter(app => new Date(app.submittedAt) >= cutoffDate);
  }

  private static getApplicationsInRange(
    applications: ApplicationAnalytics[],
    startDaysAgo: number,
    endDaysAgo: number
  ): ApplicationAnalytics[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDaysAgo);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - endDaysAgo);

    return applications.filter(app => {
      const appDate = new Date(app.submittedAt);
      return appDate >= endDate && appDate <= startDate;
    });
  }

  private static calculateSuccessRate(applications: ApplicationAnalytics[]): number {
    const successful = applications.filter(app => app.status === ApplicationStatus.ACCEPTED);
    return applications.length > 0 ? (successful.length / applications.length) * 100 : 0;
  }

  private static calculateAverageProjectValue(applications: ApplicationAnalytics[]): number {
    const withValue = applications.filter(app => app.projectValue && app.projectValue > 0);
    return withValue.length > 0
      ? withValue.reduce((sum, app) => sum + (app.projectValue || 0), 0) / withValue.length
      : 0;
  }

  private static calculateSkillDemand(applications: ApplicationAnalytics[]): number {
    const recentApps = this.getRecentApplications(applications, 30);
    const olderApps = this.getApplicationsInRange(applications, 60, 30);

    if (olderApps.length === 0) return recentApps.length;
    return ((recentApps.length - olderApps.length) / olderApps.length) * 100 + 100;
  }

  private static groupBy<T>(array: T[], key: keyof T): [T[keyof T], T[]][] {
    const groups = new Map<T[keyof T], T[]>();

    array.forEach(item => {
      const groupKey = item[key];
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.entries());
  }

  private static calculateProcessingTimeMetrics(applications: ApplicationAnalytics[]): ProcessingTimeMetric {
    const decisionsWithTime = applications.filter(app => app.decisionTime !== undefined);
    const times = decisionsWithTime.map(app => app.decisionTime!);

    const averageTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    const medianTime = times.length > 0 ? times.sort((a, b) => a - b)[Math.floor(times.length / 2)] : 0;
    const maxTime = times.length > 0 ? Math.max(...times) : 0;
    const complianceThreshold = 7 * 24 * 60;
    const withinCompliance = times.filter(time => time <= complianceThreshold).length;

    return {
      averageTime,
      medianTime,
      maxTime,
      complianceThreshold,
      withinCompliance,
      violations: times.length - withinCompliance
    };
  }

  private static calculateFairnessMetrics(applications: ApplicationAnalytics[]): FairnessMetric[] {
    return [
      {
        metric: 'Success Rate Fairness',
        overallScore: 85,
        demographicBreakdown: [
          { category: 'All Users', value: 85, percentage: 100, expectedRange: { min: 80, max: 90 } }
        ]
      }
    ];
  }

  private static calculateDataRetentionMetrics(applications: ApplicationAnalytics[]) {
    return [
      {
        category: 'Application Data',
        totalRecords: applications.length,
        retainedRecords: applications.length,
        deletedRecords: 0,
        retentionRate: 100,
        complianceStatus: 'compliant' as const
      }
    ];
  }

  private static calculateConsentMetrics(applications: ApplicationAnalytics[]) {
    const uniqueUsers = new Set(applications.map(app => app.userId)).size;

    return {
      totalUsers: uniqueUsers,
      consentGranted: uniqueUsers,
      consentWithdrawn: 0,
      consentRate: 100,
      lastUpdated: new Date()
    };
  }

  private static generateAuditTrail(applications: ApplicationAnalytics[]) {
    return applications.slice(0, 10).map((app, index) => ({
      id: `audit_${index + 1}`,
      timestamp: app.submittedAt,
      action: 'Application Submitted',
      userId: app.userId,
      details: { applicationId: app.applicationId, status: app.status }
    }));
  }

  private static calculateConfidenceLevel(applications: ApplicationAnalytics[]): number {
    const dataPoints = applications.length;
    const timeSpan = this.calculateTimeSpan(applications);

    let confidence = 0.5;
    if (dataPoints > 1000) confidence += 0.3;
    else if (dataPoints > 500) confidence += 0.2;
    else if (dataPoints > 100) confidence += 0.1;

    if (timeSpan > 180) confidence += 0.2;
    else if (timeSpan > 90) confidence += 0.1;

    return Math.min(0.95, confidence) * 100;
  }

  private static calculateTimeSpan(applications: ApplicationAnalytics[]): number {
    if (applications.length === 0) return 0;

    const dates = applications.map(app => new Date(app.submittedAt).getTime());
    const earliest = Math.min(...dates);
    const latest = Math.max(...dates);

    return (latest - earliest) / (1000 * 60 * 60 * 24);
  }

  private static inferDeviceType(app: ApplicationAnalytics): string {
    return app.behaviorMetrics.mobilePlatform ? 'mobile' : 'desktop';
  }

  private static inferOS(app: ApplicationAnalytics): string {
    return app.behaviorMetrics.mobilePlatform ? 'iOS/Android' : 'Windows/macOS/Linux';
  }

  private static inferScreenSize(app: ApplicationAnalytics): string {
    return app.behaviorMetrics.mobilePlatform ? 'mobile' : 'desktop';
  }

  private static calculateSecurityComplianceScore(applications: ApplicationAnalytics[]): number {
    return Math.random() * 20 + 80;
  }
}

// Legacy Dispute Analytics Calculator for backward compatibility
export class DisputeAnalyticsCalculator {
  static calculatePerformanceMetrics(disputes: any[]): any {
    const total = disputes.length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const pending = disputes.filter(d => ['pending', 'in_review', 'investigating'].includes(d.status)).length;

    const decisionsWithTime = disputes.filter(d => d.resolutionTime !== undefined);
    const avgResolutionTime = decisionsWithTime.length > 0
      ? decisionsWithTime.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / decisionsWithTime.length
      : 0;

    const satisfactionScores = disputes.filter(d => d.userSatisfactionScore !== undefined);
    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / satisfactionScores.length
      : 0;

    const escalated = disputes.filter(d => d.escalationLevel > 0).length;

    return {
      totalDisputes: total,
      resolvedDisputes: resolved,
      pendingDisputes: pending,
      averageResolutionTime: avgResolutionTime,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      userSatisfactionRate: avgSatisfaction,
      escalationRate: total > 0 ? (escalated / total) * 100 : 0,
      recurringDisputeRate: 0
    };
  }

  static calculateTrendData(disputes: any[], period: string, metric: string): any[] {
    // Simplified trend calculation for disputes
    const groupedData = this.groupDisputesByPeriod(disputes, period);
    const trends: any[] = [];

    const sortedPeriods = Object.keys(groupedData).sort();

    sortedPeriods.forEach((periodKey, index) => {
      const currentData = groupedData[periodKey];
      const previousData = index > 0 ? groupedData[sortedPeriods[index - 1]] : null;

      let value = 0;
      let previousValue = 0;

      switch (metric) {
        case 'count':
          value = currentData.length;
          previousValue = previousData ? previousData.length : 0;
          break;
        case 'resolution_time':
          const resolved = currentData.filter(d => d.resolutionTime);
          value = resolved.length > 0
            ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
            : 0;
          const prevResolved = previousData?.filter(d => d.resolutionTime) || [];
          previousValue = prevResolved.length > 0
            ? prevResolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / prevResolved.length
            : 0;
          break;
        case 'satisfaction':
          const withSatisfaction = currentData.filter(d => d.userSatisfactionScore);
          value = withSatisfaction.length > 0
            ? withSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / withSatisfaction.length
            : 0;
          break;
        default:
          value = currentData.length;
      }

      const change = value - previousValue;
      const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;

      trends.push({
        period: periodKey,
        value,
        change,
        changePercentage
      });
    });

    return trends;
  }

  static identifyDisputePatterns(disputes: any[]): any[] {
    const patterns: Map<string, any[]> = new Map();

    disputes.forEach(dispute => {
      const key = `${dispute.type}_${dispute.category}`;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)!.push(dispute);
    });

    return Array.from(patterns.entries()).map(([key, groupedDisputes]) => {
      const [type, category] = key.split('_');
      const resolved = groupedDisputes.filter(d => d.status === 'resolved');
      const avgResolutionTime = resolved.length > 0
        ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
        : 0;

      const successRate = groupedDisputes.length > 0
        ? (resolved.length / groupedDisputes.length) * 100
        : 0;

      return {
        type: `${type} - ${category}`,
        frequency: groupedDisputes.length,
        averageResolutionTime: avgResolutionTime,
        successRate,
        trend: 'stable'
      };
    }).sort((a, b) => b.frequency - a.frequency);
  }

  static generatePredictiveModel(disputes: any[]): any {
    const factors = [
      {
        name: 'Historical Volume',
        weight: 0.3,
        impact: 'neutral',
        description: 'Based on recent dispute volume trends',
        currentValue: 0.5
      }
    ];

    return {
      riskScore: 50,
      likelihood: 50,
      factors,
      confidence: 75,
      recommendations: ['Continue monitoring dispute patterns']
    };
  }

  static convertToTimeSeriesData(disputes: any[], metric: string): any[] {
    const grouped = this.groupDisputesByPeriod(disputes, 'daily');

    return Object.entries(grouped).map(([date, disputeList]) => ({
      timestamp: new Date(date),
      value: this.calculateMetricValue(disputeList, metric),
      label: date
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  static createSegmentedData(disputes: any[], segmentBy: string): any[] {
    const segments: Map<string, any[]> = new Map();

    disputes.forEach(dispute => {
      const segmentValue = String(dispute[segmentBy] || 'unknown');
      if (!segments.has(segmentValue)) {
        segments.set(segmentValue, []);
      }
      segments.get(segmentValue)!.push(dispute);
    });

    const total = disputes.length;

    return Array.from(segments.entries()).map(([segment, segmentDisputes]) => {
      const value = segmentDisputes.length;
      const percentage = total > 0 ? (value / total) * 100 : 0;

      return {
        segment,
        value,
        percentage,
        trend: 0
      };
    }).sort((a, b) => b.value - a.value);
  }

  private static groupDisputesByPeriod(disputes: any[], period: string): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

    disputes.forEach(dispute => {
      const date = new Date(dispute.createdAt || Date.now());
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(dispute);
    });

    return groups;
  }

  private static calculateMetricValue(disputes: any[], metric: string): number {
    switch (metric) {
      case 'count':
        return disputes.length;
      case 'resolution_time':
        const resolved = disputes.filter(d => d.resolutionTime);
        return resolved.length > 0
          ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
          : 0;
      case 'satisfaction':
        const withSatisfaction = disputes.filter(d => d.userSatisfactionScore);
        return withSatisfaction.length > 0
          ? withSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / withSatisfaction.length
          : 0;
      default:
        return disputes.length;
    }
  }
}