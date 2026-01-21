import { useState, useMemo, useCallback } from 'react';
import { ProjectData } from '@/components/create-project/project-preview';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useProjectPreview = (projectData: ProjectData) => {
  const [isExporting, setIsExporting] = useState(false);

  // Validate project data
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!projectData.title || projectData.title.trim().length === 0) {
      errors.push('Project title is required');
    } else if (projectData.title.length < 10) {
      warnings.push('Project title is quite short - consider adding more detail');
    } else if (projectData.title.length > 100) {
      errors.push('Project title is too long (max 100 characters)');
    }

    // Description validation
    if (!projectData.description || projectData.description.trim().length === 0) {
      errors.push('Project description is required');
    } else if (projectData.description.length < 50) {
      warnings.push('Project description is short - consider providing more detail');
    } else if (projectData.description.length > 5000) {
      errors.push('Project description is too long (max 5000 characters)');
    }

    // Category validation
    if (!projectData.category || projectData.category.trim().length === 0) {
      errors.push('Project category is required');
    }

    // Skills validation
    if (!projectData.skills || projectData.skills.length === 0) {
      errors.push('At least one skill is required');
    } else if (projectData.skills.length > 15) {
      warnings.push('You have selected many skills - consider focusing on the most important ones');
    }

    // Budget validation
    if (!projectData.budget.amount || projectData.budget.amount <= 0) {
      errors.push('Budget amount must be greater than 0');
    } else if (projectData.budget.amount < 100) {
      warnings.push('Budget amount seems quite low');
    }

    if (!projectData.budget.currency || projectData.budget.currency.trim().length === 0) {
      errors.push('Currency is required');
    }

    if (projectData.budget.taxRate < 0 || projectData.budget.taxRate > 100) {
      errors.push('Tax rate must be between 0 and 100');
    }

    if (projectData.budget.platformFee < 0 || projectData.budget.platformFee > 100) {
      errors.push('Platform fee must be between 0 and 100');
    }

    // Timeline validation
    if (!projectData.timeline.startDate) {
      errors.push('Start date is required');
    }

    if (!projectData.timeline.endDate) {
      errors.push('End date is required');
    }

    if (projectData.timeline.startDate && projectData.timeline.endDate) {
      const startDate = new Date(projectData.timeline.startDate);
      const endDate = new Date(projectData.timeline.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        warnings.push('Start date is in the past');
      }

      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }

      const durationDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (durationDays < 1) {
        errors.push('Project duration must be at least 1 day');
      } else if (durationDays > 365) {
        warnings.push('Project duration exceeds 1 year - consider breaking into phases');
      }
    }

    // Milestones validation
    if (!projectData.timeline.milestones || projectData.timeline.milestones.length === 0) {
      warnings.push('No milestones defined - consider adding milestones to track progress');
    } else {
      const milestonesTotal = projectData.timeline.milestones.reduce(
        (sum, m) => sum + m.amount,
        0
      );

      if (milestonesTotal > projectData.budget.amount) {
        errors.push(
          `Milestone amounts (${milestonesTotal}) exceed total budget (${projectData.budget.amount})`
        );
      }

      // Validate each milestone
      projectData.timeline.milestones.forEach((milestone, index) => {
        if (!milestone.title || milestone.title.trim().length === 0) {
          errors.push(`Milestone ${index + 1} is missing a title`);
        }

        if (!milestone.description || milestone.description.trim().length === 0) {
          warnings.push(`Milestone ${index + 1} is missing a description`);
        }

        if (!milestone.dueDate) {
          errors.push(`Milestone ${index + 1} is missing a due date`);
        } else {
          const dueDate = new Date(milestone.dueDate);
          const startDate = new Date(projectData.timeline.startDate);
          const endDate = new Date(projectData.timeline.endDate);

          if (dueDate < startDate) {
            errors.push(
              `Milestone ${index + 1} due date is before project start date`
            );
          }

          if (dueDate > endDate) {
            errors.push(`Milestone ${index + 1} due date is after project end date`);
          }
        }

        if (milestone.amount <= 0) {
          errors.push(`Milestone ${index + 1} must have an amount greater than 0`);
        }

        // Validate dependencies
        if (milestone.dependencies && milestone.dependencies.length > 0) {
          milestone.dependencies.forEach((depId) => {
            const dependentMilestone = projectData.timeline.milestones.find(
              (m) => m.id === depId
            );
            if (!dependentMilestone) {
              warnings.push(
                `Milestone ${index + 1} has an invalid dependency reference`
              );
            } else {
              // Check for circular dependencies
              const depDueDate = new Date(dependentMilestone.dueDate);
              const currentDueDate = new Date(milestone.dueDate);
              if (depDueDate >= currentDueDate) {
                warnings.push(
                  `Milestone ${index + 1} depends on a milestone with a later or same due date`
                );
              }
            }
          });
        }
      });

      // Check for duplicate milestone dates
      const dates = projectData.timeline.milestones.map((m) => m.dueDate);
      const uniqueDates = new Set(dates);
      if (dates.length !== uniqueDates.size) {
        warnings.push('Multiple milestones share the same due date');
      }
    }

    // Attachments validation
    if (projectData.attachments && projectData.attachments.length > 0) {
      const totalSize = projectData.attachments.reduce((sum, a) => sum + a.size, 0);
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (totalSize > maxSize) {
        errors.push(
          `Total attachment size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds 50MB limit`
        );
      }

      if (projectData.attachments.length > 10) {
        warnings.push('You have many attachments - consider consolidating files');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [projectData]);

  // Calculate total budget including taxes and fees
  const calculateTotalBudget = useCallback((): number => {
    const subtotal = projectData.budget.amount;
    const tax = subtotal * (projectData.budget.taxRate / 100);
    const platformFee = subtotal * (projectData.budget.platformFee / 100);
    return subtotal + tax + platformFee;
  }, [projectData.budget]);

  // Export preview functionality
  const exportPreview = useCallback(
    async (data: ProjectData, format: 'pdf' | 'html'): Promise<void> => {
      setIsExporting(true);

      try {
        if (format === 'html') {
          // Generate HTML content
          const htmlContent = generateHTMLPreview(data);
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${data.title.replace(/[^a-z0-9]/gi, '_')}_preview.html`;
          link.click();
          URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
          // For PDF, we would typically use a library like jsPDF or html2pdf
          // This is a placeholder implementation
          console.log('PDF export functionality would be implemented here');
          alert(
            'PDF export requires additional setup. Please use HTML export or implement PDF generation library.'
          );
        }
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  // Validate project (returns validation result)
  const validateProject = useCallback((): ValidationResult => {
    return validation;
  }, [validation]);

  // Get completion percentage
  const getCompletionPercentage = useCallback((): number => {
    let completed = 0;
    const total = 8; // Total number of validation checks

    if (projectData.title && projectData.title.trim().length >= 10) completed++;
    if (projectData.description && projectData.description.trim().length >= 50)
      completed++;
    if (projectData.category && projectData.category.trim().length > 0) completed++;
    if (projectData.skills && projectData.skills.length > 0) completed++;
    if (projectData.budget.amount > 0) completed++;
    if (projectData.timeline.startDate && projectData.timeline.endDate) completed++;
    if (
      projectData.timeline.milestones &&
      projectData.timeline.milestones.length > 0
    )
      completed++;
    if (validation.isValid) completed++;

    return (completed / total) * 100;
  }, [projectData, validation]);

  return {
    validation,
    isValid: validation.isValid,
    isExporting,
    calculateTotalBudget,
    exportPreview,
    validateProject,
    getCompletionPercentage
  };
};

// Helper function to generate HTML preview
function generateHTMLPreview(data: ProjectData): string {
  const totalBudget =
    data.budget.amount +
    data.budget.amount * (data.budget.taxRate / 100) +
    data.budget.amount * (data.budget.platformFee / 100);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - Project Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1a202c; margin-bottom: 10px; font-size: 2.5em; }
    h2 { color: #2d3748; margin: 30px 0 15px; font-size: 1.8em; border-bottom: 2px solid #4299e1; padding-bottom: 10px; }
    h3 { color: #4a5568; margin: 20px 0 10px; font-size: 1.3em; }
    .meta { color: #718096; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .badge { display: inline-block; padding: 5px 15px; background: #edf2f7; color: #2d3748; border-radius: 20px; margin-right: 10px; margin-bottom: 10px; font-size: 0.9em; }
    .skill-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f7fafc; font-weight: 600; }
    .milestone { background: #f7fafc; padding: 15px; margin: 10px 0; border-left: 4px solid #4299e1; border-radius: 4px; }
    .total { font-size: 1.5em; font-weight: bold; color: #2b6cb0; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>${data.title}</h1>
    <div class="meta">
      <span class="badge">Status: ${data.status}</span>
      <span class="badge">Category: ${data.category}</span>
      <span class="badge">Milestones: ${data.timeline.milestones.length}</span>
    </div>

    <div class="section">
      <h2>📋 Description</h2>
      <p>${data.description}</p>
    </div>

    <div class="section">
      <h2>🏷️ Skills Required</h2>
      ${data.skills.map((skill) => `<span class="badge skill-badge">${skill}</span>`).join('')}
    </div>

    <div class="section">
      <h2>💰 Budget</h2>
      <table>
        <tr><th>Item</th><th>Amount</th></tr>
        <tr><td>Project Budget</td><td>${data.budget.currency} ${data.budget.amount.toLocaleString()}</td></tr>
        <tr><td>Tax (${data.budget.taxRate}%)</td><td>${data.budget.currency} ${(data.budget.amount * (data.budget.taxRate / 100)).toLocaleString()}</td></tr>
        <tr><td>Platform Fee (${data.budget.platformFee}%)</td><td>${data.budget.currency} ${(data.budget.amount * (data.budget.platformFee / 100)).toLocaleString()}</td></tr>
        <tr><td><strong>Total</strong></td><td class="total">${data.budget.currency} ${totalBudget.toLocaleString()}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>📅 Timeline</h2>
      <p><strong>Start Date:</strong> ${new Date(data.timeline.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> ${new Date(data.timeline.endDate).toLocaleDateString()}</p>
      <p><strong>Duration:</strong> ${Math.ceil((new Date(data.timeline.endDate).getTime() - new Date(data.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
    </div>

    <div class="section">
      <h2>🎯 Milestones</h2>
      ${data.timeline.milestones
        .map(
          (milestone, index) => `
        <div class="milestone">
          <h3>${index + 1}. ${milestone.title}</h3>
          <p>${milestone.description}</p>
          <p><strong>Due Date:</strong> ${new Date(milestone.dueDate).toLocaleDateString()} | <strong>Amount:</strong> ${data.budget.currency} ${milestone.amount.toLocaleString()}</p>
          ${milestone.dependencies && milestone.dependencies.length > 0 ? `<p><strong>Dependencies:</strong> ${milestone.dependencies.join(', ')}</p>` : ''}
        </div>
      `
        )
        .join('')}
    </div>

    ${
      data.attachments && data.attachments.length > 0
        ? `
    <div class="section">
      <h2>📎 Attachments</h2>
      <ul>
        ${data.attachments.map((att) => `<li>${att.name} (${(att.size / 1024).toFixed(2)} KB)</li>`).join('')}
      </ul>
    </div>
    `
        : ''
    }

    <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
      <p style="color: #718096; font-size: 0.9em;">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}