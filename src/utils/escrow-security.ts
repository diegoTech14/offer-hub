import {
  EscrowContract,
  EscrowCreationRequest,
  SecuritySettings,
  ComplianceSettings,
  EscrowSecurityValidation,
  ValidationResult,
  AccessControl,
  Permission,
  AuditEntry,
  EscrowType,
  EscrowStatus,
} from '@/types/escrow.types';

// Security validation utilities for escrow operations
export class EscrowSecurityValidator {
  private static readonly MIN_AMOUNT = 1; // Minimum escrow amount
  private static readonly MAX_AMOUNT = 1000000; // Maximum escrow amount
  private static readonly MAX_MILESTONES = 20; // Maximum number of milestones
  private static readonly MAX_DESCRIPTION_LENGTH = 5000; // Maximum description length
  private static readonly MIN_DESCRIPTION_LENGTH = 10; // Minimum description length
  private static readonly MAX_DISPUTE_WINDOW = 30 * 24; // 30 days in hours
  private static readonly MIN_DISPUTE_WINDOW = 24; // 1 day in hours

  /**
   * Validates escrow creation request for security compliance
   */
  static validateEscrowCreation(request: EscrowCreationRequest): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Amount validation
    results.push(...this.validateAmount(request.amount));
    
    // Milestone validation
    results.push(...this.validateMilestones(request.milestones));
    
    // Description validation
    results.push(...this.validateDescription(request.description));
    
    // Security settings validation
    results.push(...this.validateSecuritySettings(request.securitySettings));
    
    // Compliance settings validation
    results.push(...this.validateComplianceSettings(request.complianceSettings));
    
    // User validation
    results.push(...this.validateUsers(request.clientId, request.freelancerId));
    
    // Terms validation
    results.push(...this.validateTerms(request.terms));

    return results;
  }

  /**
   * Validates escrow contract for ongoing security compliance
   */
  static validateEscrowContract(contract: EscrowContract): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Contract status validation
    results.push(...this.validateContractStatus(contract));
    
    // Milestone validation
    results.push(...this.validateContractMilestones(contract.milestones));
    
    // Security settings validation
    results.push(...this.validateSecuritySettings(contract.securitySettings));
    
    // Compliance validation
    results.push(...this.validateComplianceSettings(contract.complianceSettings));
    
    // Audit trail validation
    results.push(...this.validateAuditTrail(contract.auditTrail));
    
    // Performance metrics validation
    results.push(...this.validatePerformanceMetrics(contract.performanceMetrics));

    return results;
  }

  /**
   * Calculates risk score for an escrow contract
   */
  static calculateRiskScore(contract: EscrowContract): number {
    let riskScore = 0;

    // Amount-based risk
    if (contract.amount > 100000) riskScore += 20;
    else if (contract.amount > 50000) riskScore += 10;
    else if (contract.amount > 10000) riskScore += 5;

    // Milestone complexity risk
    if (contract.milestones.length > 10) riskScore += 15;
    else if (contract.milestones.length > 5) riskScore += 10;

    // Security settings risk
    if (!contract.securitySettings.multiSigRequired) riskScore += 10;
    if (!contract.securitySettings.requireKYC) riskScore += 15;
    if (contract.securitySettings.encryptionLevel === 'standard') riskScore += 5;

    // Compliance risk
    if (contract.complianceSettings.auditLevel === 'basic') riskScore += 10;
    if (contract.complianceSettings.regulatoryRequirements.length === 0) riskScore += 15;

    // Historical performance risk
    if (contract.performanceMetrics.disputeRate > 0.1) riskScore += 20;
    if (contract.performanceMetrics.successRate < 0.8) riskScore += 15;

    return Math.min(riskScore, 100); // Cap at 100
  }

  /**
   * Generates security recommendations based on validation results
   */
  static generateSecurityRecommendations(validationResults: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    const failedChecks = validationResults.filter(result => result.status === 'fail');
    const warnings = validationResults.filter(result => result.status === 'warning');

    // High severity recommendations
    const highSeverityIssues = failedChecks.filter(check => check.severity === 'high' || check.severity === 'critical');
    if (highSeverityIssues.length > 0) {
      recommendations.push('Address high-severity security issues before proceeding');
    }

    // Specific recommendations based on failed checks
    failedChecks.forEach(check => {
      switch (check.check) {
        case 'amount_validation':
          recommendations.push('Ensure escrow amount is within acceptable limits');
          break;
        case 'milestone_validation':
          recommendations.push('Review milestone structure for security compliance');
          break;
        case 'security_settings':
          recommendations.push('Enable multi-signature and KYC requirements for enhanced security');
          break;
        case 'compliance_settings':
          recommendations.push('Configure proper compliance and audit settings');
          break;
        case 'access_controls':
          recommendations.push('Review and strengthen access control settings');
          break;
      }
    });

    // Warning-based recommendations
    warnings.forEach(warning => {
      switch (warning.check) {
        case 'encryption_level':
          recommendations.push('Consider upgrading to enhanced encryption for sensitive projects');
          break;
        case 'audit_level':
          recommendations.push('Consider increasing audit level for high-value contracts');
          break;
        case 'dispute_window':
          recommendations.push('Review dispute window settings for optimal protection');
          break;
      }
    });

    return recommendations;
  }

  /**
   * Validates access controls for security compliance
   */
  static validateAccessControls(accessControls: AccessControl[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (accessControls.length === 0) {
      results.push({
        check: 'access_controls',
        status: 'fail',
        message: 'At least one access control must be defined',
        severity: 'high',
      });
    }

    // Check for required roles
    const roles = accessControls.map(ac => ac.role);
    if (!roles.includes('client')) {
      results.push({
        check: 'access_controls',
        status: 'fail',
        message: 'Client access control is required',
        severity: 'high',
      });
    }

    if (!roles.includes('freelancer')) {
      results.push({
        check: 'access_controls',
        status: 'fail',
        message: 'Freelancer access control is required',
        severity: 'high',
      });
    }

    // Validate permissions
    accessControls.forEach((accessControl, index) => {
      if (accessControl.permissions.length === 0) {
        results.push({
          check: 'access_controls',
          status: 'fail',
          message: `Access control ${index + 1} must have at least one permission`,
          severity: 'medium',
        });
      }

      accessControl.permissions.forEach(permission => {
        if (!this.isValidPermission(permission)) {
          results.push({
            check: 'access_controls',
            status: 'fail',
            message: `Invalid permission configuration for ${accessControl.role}`,
            severity: 'medium',
          });
        }
      });
    });

    return results;
  }

  /**
   * Creates audit entry for security events
   */
  static createAuditEntry(
    action: string,
    actor: string,
    details: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
    transactionId?: string
  ): AuditEntry {
    return {
      id: this.generateSecureId(),
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      ipAddress,
      userAgent,
      transactionId,
    };
  }

  /**
   * Validates audit trail integrity
   */
  static validateAuditTrail(auditTrail: AuditEntry[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (auditTrail.length === 0) {
      results.push({
        check: 'audit_trail',
        status: 'warning',
        message: 'No audit trail entries found',
        severity: 'low',
      });
      return results;
    }

    // Check for chronological order
    for (let i = 1; i < auditTrail.length; i++) {
      const prevTimestamp = new Date(auditTrail[i - 1].timestamp);
      const currentTimestamp = new Date(auditTrail[i].timestamp);
      
      if (currentTimestamp < prevTimestamp) {
        results.push({
          check: 'audit_trail',
          status: 'fail',
          message: 'Audit trail entries are not in chronological order',
          severity: 'high',
        });
        break;
      }
    }

    // Check for required fields
    auditTrail.forEach((entry, index) => {
      if (!entry.id || !entry.timestamp || !entry.action || !entry.actor) {
        results.push({
          check: 'audit_trail',
          status: 'fail',
          message: `Audit entry ${index + 1} is missing required fields`,
          severity: 'medium',
        });
      }
    });

    return results;
  }

  /**
   * Encrypts sensitive escrow data
   */
  static encryptSensitiveData(data: string, encryptionLevel: 'standard' | 'enhanced' | 'military'): string {
    // This is a placeholder implementation
    // In a real application, you would use proper encryption libraries
    const key = this.getEncryptionKey(encryptionLevel);
    return btoa(data + key); // Simple base64 encoding for demo
  }

  /**
   * Decrypts sensitive escrow data
   */
  static decryptSensitiveData(encryptedData: string, encryptionLevel: 'standard' | 'enhanced' | 'military'): string {
    // This is a placeholder implementation
    const key = this.getEncryptionKey(encryptionLevel);
    const decoded = atob(encryptedData);
    return decoded.replace(key, '');
  }

  // Private helper methods
  private static validateAmount(amount: number): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (amount < this.MIN_AMOUNT) {
      results.push({
        check: 'amount_validation',
        status: 'fail',
        message: `Amount must be at least ${this.MIN_AMOUNT}`,
        severity: 'high',
      });
    }

    if (amount > this.MAX_AMOUNT) {
      results.push({
        check: 'amount_validation',
        status: 'fail',
        message: `Amount cannot exceed ${this.MAX_AMOUNT}`,
        severity: 'high',
      });
    }

    return results;
  }

  private static validateMilestones(milestones: any[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!milestones || milestones.length === 0) {
      results.push({
        check: 'milestone_validation',
        status: 'fail',
        message: 'At least one milestone is required',
        severity: 'high',
      });
      return results;
    }

    if (milestones.length > this.MAX_MILESTONES) {
      results.push({
        check: 'milestone_validation',
        status: 'fail',
        message: `Cannot have more than ${this.MAX_MILESTONES} milestones`,
        severity: 'medium',
      });
    }

    milestones.forEach((milestone, index) => {
      if (!milestone.title || milestone.title.trim().length === 0) {
        results.push({
          check: 'milestone_validation',
          status: 'fail',
          message: `Milestone ${index + 1} must have a title`,
          severity: 'medium',
        });
      }

      if (!milestone.amount || milestone.amount <= 0) {
        results.push({
          check: 'milestone_validation',
          status: 'fail',
          message: `Milestone ${index + 1} must have a valid amount`,
          severity: 'high',
        });
      }
    });

    return results;
  }

  private static validateDescription(description: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!description || description.trim().length < this.MIN_DESCRIPTION_LENGTH) {
      results.push({
        check: 'description_validation',
        status: 'fail',
        message: `Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters long`,
        severity: 'medium',
      });
    }

    if (description.length > this.MAX_DESCRIPTION_LENGTH) {
      results.push({
        check: 'description_validation',
        status: 'fail',
        message: `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`,
        severity: 'low',
      });
    }

    return results;
  }

  private static validateSecuritySettings(settings: SecuritySettings): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (settings.maxDisputeWindow < this.MIN_DISPUTE_WINDOW) {
      results.push({
        check: 'security_settings',
        status: 'fail',
        message: `Dispute window must be at least ${this.MIN_DISPUTE_WINDOW} hours`,
        severity: 'medium',
      });
    }

    if (settings.maxDisputeWindow > this.MAX_DISPUTE_WINDOW) {
      results.push({
        check: 'security_settings',
        status: 'warning',
        message: `Dispute window longer than ${this.MAX_DISPUTE_WINDOW} hours may impact user experience`,
        severity: 'low',
      });
    }

    results.push(...this.validateAccessControls(settings.accessControls));

    return results;
  }

  private static validateComplianceSettings(settings: ComplianceSettings): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!settings.jurisdiction || settings.jurisdiction.trim().length === 0) {
      results.push({
        check: 'compliance_settings',
        status: 'fail',
        message: 'Jurisdiction must be specified',
        severity: 'high',
      });
    }

    if (settings.regulatoryRequirements.length === 0) {
      results.push({
        check: 'compliance_settings',
        status: 'warning',
        message: 'No regulatory requirements specified',
        severity: 'low',
      });
    }

    return results;
  }

  private static validateUsers(clientId: string, freelancerId: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!clientId || clientId.trim().length === 0) {
      results.push({
        check: 'user_validation',
        status: 'fail',
        message: 'Client ID is required',
        severity: 'high',
      });
    }

    if (!freelancerId || freelancerId.trim().length === 0) {
      results.push({
        check: 'user_validation',
        status: 'fail',
        message: 'Freelancer ID is required',
        severity: 'high',
      });
    }

    if (clientId === freelancerId) {
      results.push({
        check: 'user_validation',
        status: 'fail',
        message: 'Client and freelancer cannot be the same user',
        severity: 'high',
      });
    }

    return results;
  }

  private static validateTerms(terms: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!terms || terms.trim().length < 50) {
      results.push({
        check: 'terms_validation',
        status: 'fail',
        message: 'Terms must be at least 50 characters long',
        severity: 'medium',
      });
    }

    return results;
  }

  private static validateContractStatus(contract: EscrowContract): ValidationResult[] {
    const results: ValidationResult[] = [];

    const validStatuses: EscrowStatus[] = ['pending', 'active', 'completed', 'disputed', 'cancelled', 'expired'];
    if (!validStatuses.includes(contract.status)) {
      results.push({
        check: 'contract_status',
        status: 'fail',
        message: 'Invalid contract status',
        severity: 'high',
      });
    }

    return results;
  }

  private static validateContractMilestones(milestones: any[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    milestones.forEach((milestone, index) => {
      const validStatuses = ['pending', 'completed', 'overdue', 'disputed'];
      if (!validStatuses.includes(milestone.status)) {
        results.push({
          check: 'milestone_status',
          status: 'fail',
          message: `Invalid status for milestone ${index + 1}`,
          severity: 'medium',
        });
      }
    });

    return results;
  }

  private static validatePerformanceMetrics(metrics: any): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (metrics.disputeRate < 0 || metrics.disputeRate > 1) {
      results.push({
        check: 'performance_metrics',
        status: 'fail',
        message: 'Dispute rate must be between 0 and 1',
        severity: 'medium',
      });
    }

    if (metrics.successRate < 0 || metrics.successRate > 1) {
      results.push({
        check: 'performance_metrics',
        status: 'fail',
        message: 'Success rate must be between 0 and 1',
        severity: 'medium',
      });
    }

    return results;
  }

  private static isValidPermission(permission: Permission): boolean {
    const validActions = ['view', 'modify', 'release', 'dispute', 'approve'];
    const validScopes = ['milestone', 'contract', 'funds', 'all'];

    return validActions.includes(permission.action) && validScopes.includes(permission.scope);
  }

  private static generateSecureId(): string {
    return 'audit_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private static getEncryptionKey(level: 'standard' | 'enhanced' | 'military'): string {
    const keys = {
      standard: 'std_key_2024',
      enhanced: 'enh_key_2024_secure',
      military: 'mil_key_2024_ultra_secure',
    };
    return keys[level];
  }
}

// Security utility functions
export const escrowSecurityUtils = {
  /**
   * Generates a comprehensive security validation report
   */
  generateSecurityReport(contract: EscrowContract): EscrowSecurityValidation {
    const validationResults = EscrowSecurityValidator.validateEscrowContract(contract);
    const riskScore = EscrowSecurityValidator.calculateRiskScore(contract);
    const recommendations = EscrowSecurityValidator.generateSecurityRecommendations(validationResults);

    const riskLevel = riskScore >= 80 ? 'critical' : 
                     riskScore >= 60 ? 'high' : 
                     riskScore >= 40 ? 'medium' : 'low';

    return {
      contractId: contract.id,
      validationResults,
      riskScore,
      riskLevel,
      recommendations,
      lastValidated: new Date().toISOString(),
    };
  },

  /**
   * Validates user permissions for escrow operations
   */
  validateUserPermissions(
    userId: string,
    contract: EscrowContract,
    action: string
  ): boolean {
    const userRole = userId === contract.clientId ? 'client' : 
                    userId === contract.freelancerId ? 'freelancer' : 'other';

    const accessControl = contract.securitySettings.accessControls.find(
      ac => ac.role === userRole
    );

    if (!accessControl) {
      return false;
    }

    return accessControl.permissions.some(permission => 
      permission.action === action || permission.action === 'all'
    );
  },

  /**
   * Creates secure audit trail entry
   */
  logSecurityEvent(
    contractId: string,
    action: string,
    actor: string,
    details: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): AuditEntry {
    return EscrowSecurityValidator.createAuditEntry(
      action,
      actor,
      details,
      ipAddress,
      userAgent
    );
  },

  /**
   * Encrypts sensitive contract data
   */
  encryptContractData(data: string, encryptionLevel: 'standard' | 'enhanced' | 'military'): string {
    return EscrowSecurityValidator.encryptSensitiveData(data, encryptionLevel);
  },

  /**
   * Decrypts sensitive contract data
   */
  decryptContractData(encryptedData: string, encryptionLevel: 'standard' | 'enhanced' | 'military'): string {
    return EscrowSecurityValidator.decryptSensitiveData(encryptedData, encryptionLevel);
  },

  /**
   * Validates escrow creation request
   */
  validateCreationRequest(request: EscrowCreationRequest): ValidationResult[] {
    return EscrowSecurityValidator.validateEscrowCreation(request);
  },

  /**
   * Calculates escrow risk score
   */
  calculateRiskScore(contract: EscrowContract): number {
    return EscrowSecurityValidator.calculateRiskScore(contract);
  },
};
