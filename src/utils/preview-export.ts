import { ProjectData } from '@/components/create-project/project-preview';

/**
 * Sanitize filename for safe file downloads
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .substring(0, 100);
};

/**
 * Download file helper
 */
const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format currency for display
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Calculate budget totals
 */
const calculateBudgetTotals = (projectData: ProjectData) => {
  const { budget, timeline } = projectData;
  const baseAmount = budget.amount || 0;
  const platformFeeAmount = (baseAmount * (budget.platformFee || 0)) / 100;
  const taxAmount = (baseAmount * (budget.taxRate || 0)) / 100;
  const totalAmount = baseAmount + platformFeeAmount + taxAmount;
  
  const milestoneTotalAmount = timeline.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  
  return {
    baseAmount,
    platformFeeAmount,
    platformFeePercentage: budget.platformFee || 0,
    taxAmount,
    taxPercentage: budget.taxRate || 0,
    totalAmount,
    milestoneTotalAmount,
    currency: budget.currency || 'USD'
  };
};

/**
 * Generate HTML content for project preview
 */
const generateHTMLContent = (projectData: ProjectData): string => {
  const {
    title,
    description,
    category,
    skills = [],
    timeline,
    attachments = [],
    status
  } = projectData;
  
  const budgetCalc = calculateBudgetTotals(projectData);
  const milestones = timeline.milestones || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Project Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    h1 {
      color: #1e40af;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }
    
    .status-draft {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-active {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-completed {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      color: #666;
      font-size: 0.9em;
      margin-top: 15px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    h2 {
      color: #1e40af;
      font-size: 1.5em;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .description {
      color: #4b5563;
      font-size: 1.1em;
      line-height: 1.8;
      margin-bottom: 20px;
      white-space: pre-wrap;
    }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .skill-tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 500;
    }
    
    .budget-breakdown {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    
    .budget-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .budget-row:last-child {
      border-bottom: none;
    }
    
    .budget-total {
      font-weight: bold;
      font-size: 1.2em;
      color: #1e40af;
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #1e40af;
    }
    
    .milestones {
      display: grid;
      gap: 15px;
    }
    
    .milestone {
      background: #f9fafb;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 4px;
    }
    
    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
    }
    
    .milestone-title {
      font-weight: 600;
      color: #1e40af;
      font-size: 1.1em;
    }
    
    .milestone-amount {
      font-weight: 600;
      color: #059669;
    }
    
    .milestone-meta {
      color: #666;
      font-size: 0.9em;
      margin-top: 5px;
    }
    
    .milestone-description {
      color: #4b5563;
      margin-top: 8px;
      line-height: 1.6;
    }
    
    .milestone-dependencies {
      margin-top: 8px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      font-size: 0.85em;
      color: #666;
    }
    
    .attachments {
      list-style: none;
    }
    
    .attachment-item {
      padding: 12px;
      background: #f9fafb;
      margin-bottom: 8px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .attachment-name {
      color: #1e40af;
      font-weight: 500;
    }
    
    .attachment-meta {
      color: #666;
      font-size: 0.85em;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    
    .timeline-visual {
      position: relative;
      padding-left: 30px;
      margin: 20px 0;
    }
    
    .timeline-visual::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #3b82f6;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -24px;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #3b82f6;
    }
    
    .timeline-dates {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .timeline-dates-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
    }
    
    .info-label {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 1.1em;
      font-weight: 600;
      color: #1e40af;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.8em;
      }
      
      .meta {
        flex-direction: column;
        gap: 10px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .milestone-header {
        flex-direction: column;
        gap: 8px;
      }
      
      .attachment-item {
        flex-direction: column;
        align-items: start;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <span class="status-badge status-${status}">${status}</span>
      <div class="meta">
        <div class="meta-item">
          <strong>📁 Category:</strong> ${category || 'Not specified'}
        </div>
        <div class="meta-item">
          <strong>💰 Total Budget:</strong> ${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}
        </div>
        <div class="meta-item">
          <strong>📅 Duration:</strong> ${timeline.startDate && timeline.endDate ? 
            `${formatDate(timeline.startDate)} - ${formatDate(timeline.endDate)}` : 
            'Not specified'}
        </div>
        <div class="meta-item">
          <strong>🎯 Milestones:</strong> ${milestones.length}
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>📋 Project Description</h2>
      <div class="description">${description || 'No description provided.'}</div>
    </div>
    
    ${skills.length > 0 ? `
    <div class="section">
      <h2>🛠️ Required Skills</h2>
      <div class="skills">
        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="section">
      <h2>💰 Budget Breakdown</h2>
      <div class="budget-breakdown">
        <div class="budget-row">
          <span>Base Project Budget</span>
          <span>${formatCurrency(budgetCalc.baseAmount, budgetCalc.currency)}</span>
        </div>
        ${budgetCalc.platformFeeAmount > 0 ? `
        <div class="budget-row">
          <span>Platform Fee (${budgetCalc.platformFeePercentage}%)</span>
          <span>${formatCurrency(budgetCalc.platformFeeAmount, budgetCalc.currency)}</span>
        </div>
        ` : ''}
        ${budgetCalc.taxAmount > 0 ? `
        <div class="budget-row">
          <span>Tax (${budgetCalc.taxPercentage}%)</span>
          <span>${formatCurrency(budgetCalc.taxAmount, budgetCalc.currency)}</span>
        </div>
        ` : ''}
        <div class="budget-row budget-total">
          <span>Total Project Cost</span>
          <span>${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}</span>
        </div>
      </div>
      
      ${budgetCalc.milestoneTotalAmount > 0 ? `
      <div style="margin-top: 15px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 0.9em;">
        <strong>💡 Note:</strong> Total milestone payments: ${formatCurrency(budgetCalc.milestoneTotalAmount, budgetCalc.currency)}
        ${Math.abs(budgetCalc.milestoneTotalAmount - budgetCalc.baseAmount) > 0.01 ? 
          ` (${budgetCalc.milestoneTotalAmount > budgetCalc.baseAmount ? 'exceeds' : 'under'} base budget by ${formatCurrency(Math.abs(budgetCalc.milestoneTotalAmount - budgetCalc.baseAmount), budgetCalc.currency)})` : 
          ' (matches base budget)'}
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2>📅 Project Timeline</h2>
      
      ${timeline.startDate || timeline.endDate ? `
      <div class="timeline-dates">
        ${timeline.startDate ? `
        <div class="timeline-dates-row">
          <strong>Start Date:</strong>
          <span>${formatDate(timeline.startDate)}</span>
        </div>
        ` : ''}
        ${timeline.endDate ? `
        <div class="timeline-dates-row">
          <strong>End Date:</strong>
          <span>${formatDate(timeline.endDate)}</span>
        </div>
        ` : ''}
        ${timeline.startDate && timeline.endDate ? `
        <div class="timeline-dates-row">
          <strong>Total Duration:</strong>
          <span>${Math.ceil((new Date(timeline.endDate).getTime() - new Date(timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      ${milestones.length > 0 ? `
      <h3 style="color: #1e40af; margin-top: 25px; margin-bottom: 15px;">Milestones</h3>
      <div class="timeline-visual">
        ${milestones.map((milestone, index) => `
          <div class="timeline-item">
            <div class="milestone">
              <div class="milestone-header">
                <div>
                  <div class="milestone-title">${index + 1}. ${milestone.title}</div>
                  <div class="milestone-meta">
                    ${milestone.dueDate ? `📅 Due: ${formatDate(milestone.dueDate)}` : '📅 No due date'}
                    ${milestone.id ? ` • ID: ${milestone.id}` : ''}
                  </div>
                </div>
                ${milestone.amount ? `
                <div class="milestone-amount">${formatCurrency(milestone.amount, budgetCalc.currency)}</div>
                ` : ''}
              </div>
              ${milestone.description ? `
              <div class="milestone-description">${milestone.description}</div>
              ` : ''}
              ${milestone.dependencies && milestone.dependencies.length > 0 ? `
              <div class="milestone-dependencies">
                <strong>Dependencies:</strong> ${milestone.dependencies.join(', ')}
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      ` : '<p style="color: #666;">No milestones defined yet.</p>'}
    </div>
    
    ${attachments.length > 0 ? `
    <div class="section">
      <h2>📎 Attachments</h2>
      <ul class="attachments">
        ${attachments.map(attachment => `
          <li class="attachment-item">
            <div>
              <div class="attachment-name">${attachment.name}</div>
              <div class="attachment-meta">Type: ${attachment.type || 'Unknown'}</div>
            </div>
            <div class="attachment-meta">${formatFileSize(attachment.size || 0)}</div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div class="section">
      <h2>📊 Project Summary</h2>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Total Budget</div>
          <div class="info-value">${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Milestones</div>
          <div class="info-value">${milestones.length}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Required Skills</div>
          <div class="info-value">${skills.length}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Attachments</div>
          <div class="info-value">${attachments.length}</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Project Preview Generated</strong></p>
      <p>${formatDate(new Date())}</p>
      <p style="margin-top: 10px; font-size: 0.85em;">Status: ${status.toUpperCase()} • Category: ${category}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate PDF-optimized content
 */
const generatePDFContent = (projectData: ProjectData): string => {
  // Use the same HTML content but with PDF-optimized styling
  return generateHTMLContent(projectData);
};

/**
 * Generate print-ready HTML for PDF conversion
 */
const generatePDFReadyHTML = (projectData: ProjectData): string => {
  const htmlContent = generateHTMLContent(projectData);
  
  // Add print instructions
  return htmlContent.replace(
    '</body>',
    `
    <script>
      window.onload = function() {
        alert('To save as PDF: Press Ctrl+P (or Cmd+P on Mac), then select "Save as PDF" as the printer.');
      };
    </script>
    </body>
    `
  );
};

/**
 * Export project preview to HTML format
 */
export const exportToHTML = async (projectData: ProjectData): Promise<void> => {
  const htmlContent = generateHTMLContent(projectData);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  downloadFile(blob, `${sanitizeFilename(projectData.title)}_preview.html`);
};

/**
 * Export project preview to PDF format
 * Note: This requires html2pdf.js or similar library to be installed
 */
export const exportToPDF = async (projectData: ProjectData): Promise<void> => {
  try {
    // Check if html2pdf is available
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      const element = document.createElement('div');
      element.innerHTML = generatePDFContent(projectData);
      
      const opt = {
        margin: 1,
        filename: `${sanitizeFilename(projectData.title)}_preview.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await (window as any).html2pdf().set(opt).from(element).save();
    } else {
      // Fallback: Generate HTML and suggest browser print
      console.warn('html2pdf library not found. Falling back to HTML export.');
      const htmlContent = generatePDFReadyHTML(projectData);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      downloadFile(blob, `${sanitizeFilename(projectData.title)}_print.html`);
      
      alert(
        'PDF export requires additional setup. An HTML file has been generated that you can print to PDF using your browser.'
      );
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try HTML export instead.');
  }
};

/**
 * Export project data as JSON
 */
export const exportToJSON = async (projectData: ProjectData): Promise<void> => {
  const jsonContent = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  downloadFile(blob, `${sanitizeFilename(projectData.title)}_data.json`);
};

/**
 * Export project data as Markdown
 */
export const exportToMarkdown = async (projectData: ProjectData): Promise<void> => {
  const {
    title,
    description,
    category,
    skills = [],
    timeline,
    attachments = [],
    status
  } = projectData;
  
  const budgetCalc = calculateBudgetTotals(projectData);
  const milestones = timeline.milestones || [];

  const markdown = `
# ${title}

**Status:** ${status.toUpperCase()}  
**Category:** ${category || 'Not specified'}  
**Generated:** ${formatDate(new Date())}

---

## 📋 Project Description

${description || 'No description provided.'}

---

${skills.length > 0 ? `
## 🛠️ Required Skills

${skills.map(skill => `- ${skill}`).join('\n')}

---
` : ''}

## 💰 Budget Breakdown

| Item | Amount |
|------|--------|
| Base Project Budget | ${formatCurrency(budgetCalc.baseAmount, budgetCalc.currency)} |
${budgetCalc.platformFeeAmount > 0 ? `| Platform Fee (${budgetCalc.platformFeePercentage}%) | ${formatCurrency(budgetCalc.platformFeeAmount, budgetCalc.currency)} |` : ''}
${budgetCalc.taxAmount > 0 ? `| Tax (${budgetCalc.taxPercentage}%) | ${formatCurrency(budgetCalc.taxAmount, budgetCalc.currency)} |` : ''}
| **Total Project Cost** | **${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}** |

${budgetCalc.milestoneTotalAmount > 0 ? `
> **Note:** Total milestone payments: ${formatCurrency(budgetCalc.milestoneTotalAmount, budgetCalc.currency)}
` : ''}

---

## 📅 Project Timeline

${timeline.startDate ? `- **Start Date:** ${formatDate(timeline.startDate)}` : ''}
${timeline.endDate ? `- **End Date:** ${formatDate(timeline.endDate)}` : ''}
${timeline.startDate && timeline.endDate ? `- **Duration:** ${Math.ceil((new Date(timeline.endDate).getTime() - new Date(timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : ''}

${milestones.length > 0 ? `
### Milestones

${milestones.map((milestone, index) => `
#### ${index + 1}. ${milestone.title}

- **Due Date:** ${milestone.dueDate ? formatDate(milestone.dueDate) : 'Not specified'}
${milestone.amount ? `- **Payment:** ${formatCurrency(milestone.amount, budgetCalc.currency)}` : ''}
${milestone.id ? `- **ID:** ${milestone.id}` : ''}
${milestone.description ? `- **Description:** ${milestone.description}` : ''}
${milestone.dependencies && milestone.dependencies.length > 0 ? `- **Dependencies:** ${milestone.dependencies.join(', ')}` : ''}
`).join('\n')}
` : ''}

---

${attachments.length > 0 ? `
## 📎 Attachments

${attachments.map(attachment => `- **${attachment.name}** (${attachment.type || 'Unknown'}) - ${formatFileSize(attachment.size || 0)}`).join('\n')}

---
` : ''}

## 📊 Project Summary

- **Total Budget:** ${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}
- **Milestones:** ${milestones.length}
- **Required Skills:** ${skills.length}
- **Attachments:** ${attachments.length}
- **Status:** ${status.toUpperCase()}

---

*Project preview exported on ${formatDate(new Date())}*
  `.trim();

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  downloadFile(blob, `${sanitizeFilename(projectData.title)}_preview.md`);
};

/**
 * Export project data in CSV format (for budget and milestones)
 */
export const exportToCSV = async (projectData: ProjectData): Promise<void> => {
  const { title, timeline } = projectData;
  const budgetCalc = calculateBudgetTotals(projectData);
  const milestones = timeline.milestones || [];
  
  let csvContent = `Project Export - ${title}\n\n`;
  
  // Budget section
  csvContent += 'Budget Breakdown\n';
  csvContent += 'Item,Amount\n';
  csvContent += `Base Project Budget,${budgetCalc.baseAmount}\n`;
  if (budgetCalc.platformFeeAmount > 0) {
    csvContent += `Platform Fee (${budgetCalc.platformFeePercentage}%),${budgetCalc.platformFeeAmount}\n`;
  }
  if (budgetCalc.taxAmount > 0) {
    csvContent += `Tax (${budgetCalc.taxPercentage}%),${budgetCalc.taxAmount}\n`;
  }
  csvContent += `Total,${budgetCalc.totalAmount}\n\n`;
  
  // Milestones section
  if (milestones.length > 0) {
    csvContent += 'Milestones\n';
    csvContent += 'ID,Title,Due Date,Amount,Description,Dependencies\n';
    milestones.forEach(milestone => {
      const dueDate = milestone.dueDate ? formatDate(milestone.dueDate) : '';
      const amount = milestone.amount || 0;
      const description = (milestone.description || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/"/g, '""');
      const dependencies = milestone.dependencies ? milestone.dependencies.join('; ') : '';
      csvContent += `"${milestone.id || ''}","${milestone.title}","${dueDate}",${amount},"${description}","${dependencies}"\n`;
    });
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  downloadFile(blob, `${sanitizeFilename(title)}_export.csv`);
};

/**
 * Share project preview (copy link to clipboard)
 */
export const shareProjectPreview = async (projectId: string): Promise<void> => {
  const shareUrl = `${window.location.origin}/projects/${projectId}/preview`;
  
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Project preview link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback: show the link in a prompt
    prompt('Copy this link to share the project preview:', shareUrl);
  }
};

/**
 * Print project preview
 */
export const printProjectPreview = (): void => {
  window.print();
};

/**
 * Export all formats in a zip (requires JSZip library)
 */
export const exportAllFormats = async (projectData: ProjectData): Promise<void> => {
  try {
    // Check if JSZip is available
    if (typeof window !== 'undefined' && (window as any).JSZip) {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      
      // Add HTML
      const htmlContent = generateHTMLContent(projectData);
      zip.file(`${sanitizeFilename(projectData.title)}_preview.html`, htmlContent);
      
      // Add JSON
      const jsonContent = JSON.stringify(projectData, null, 2);
      zip.file(`${sanitizeFilename(projectData.title)}_data.json`, jsonContent);
      
      // Add Markdown (manually generate it here to avoid async issues)
      const {
        title,
        description,
        category,
        skills = [],
        timeline,
        attachments = [],
        status
      } = projectData;
      
      const budgetCalc = calculateBudgetTotals(projectData);
      const milestones = timeline.milestones || [];

      const markdown = `
# ${title}

**Status:** ${status.toUpperCase()}  
**Category:** ${category || 'Not specified'}  
**Generated:** ${formatDate(new Date())}

---

## 📋 Project Description

${description || 'No description provided.'}

---

${skills.length > 0 ? `
## 🛠️ Required Skills

${skills.map(skill => `- ${skill}`).join('\n')}

---
` : ''}

## 💰 Budget Breakdown

| Item | Amount |
|------|--------|
| Base Project Budget | ${formatCurrency(budgetCalc.baseAmount, budgetCalc.currency)} |
${budgetCalc.platformFeeAmount > 0 ? `| Platform Fee (${budgetCalc.platformFeePercentage}%) | ${formatCurrency(budgetCalc.platformFeeAmount, budgetCalc.currency)} |` : ''}
${budgetCalc.taxAmount > 0 ? `| Tax (${budgetCalc.taxPercentage}%) | ${formatCurrency(budgetCalc.taxAmount, budgetCalc.currency)} |` : ''}
| **Total Project Cost** | **${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}** |

${budgetCalc.milestoneTotalAmount > 0 ? `
> **Note:** Total milestone payments: ${formatCurrency(budgetCalc.milestoneTotalAmount, budgetCalc.currency)}
` : ''}

---

## 📅 Project Timeline

${timeline.startDate ? `- **Start Date:** ${formatDate(timeline.startDate)}` : ''}
${timeline.endDate ? `- **End Date:** ${formatDate(timeline.endDate)}` : ''}
${timeline.startDate && timeline.endDate ? `- **Duration:** ${Math.ceil((new Date(timeline.endDate).getTime() - new Date(timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days` : ''}

${milestones.length > 0 ? `
### Milestones

${milestones.map((milestone, index) => `
#### ${index + 1}. ${milestone.title}

- **Due Date:** ${milestone.dueDate ? formatDate(milestone.dueDate) : 'Not specified'}
${milestone.amount ? `- **Payment:** ${formatCurrency(milestone.amount, budgetCalc.currency)}` : ''}
${milestone.id ? `- **ID:** ${milestone.id}` : ''}
${milestone.description ? `- **Description:** ${milestone.description}` : ''}
${milestone.dependencies && milestone.dependencies.length > 0 ? `- **Dependencies:** ${milestone.dependencies.join(', ')}` : ''}
`).join('\n')}
` : ''}

---

${attachments.length > 0 ? `
## 📎 Attachments

${attachments.map(attachment => `- **${attachment.name}** (${attachment.type || 'Unknown'}) - ${formatFileSize(attachment.size || 0)}`).join('\n')}

---
` : ''}

## 📊 Project Summary

- **Total Budget:** ${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}
- **Milestones:** ${milestones.length}
- **Required Skills:** ${skills.length}
- **Attachments:** ${attachments.length}
- **Status:** ${status.toUpperCase()}

---

*Project preview exported on ${formatDate(new Date())}*
      `.trim();
      
      zip.file(`${sanitizeFilename(projectData.title)}_preview.md`, markdown);
      
      // Add CSV
      let csvContent = `Project Export - ${projectData.title}\n\n`;
      csvContent += 'Budget Breakdown\n';
      csvContent += 'Item,Amount\n';
      csvContent += `Base Project Budget,${budgetCalc.baseAmount}\n`;
      if (budgetCalc.platformFeeAmount > 0) {
        csvContent += `Platform Fee (${budgetCalc.platformFeePercentage}%),${budgetCalc.platformFeeAmount}\n`;
      }
      if (budgetCalc.taxAmount > 0) {
        csvContent += `Tax (${budgetCalc.taxPercentage}%),${budgetCalc.taxAmount}\n`;
      }
      csvContent += `Total,${budgetCalc.totalAmount}\n\n`;
      
      if (milestones.length > 0) {
        csvContent += 'Milestones\n';
        csvContent += 'ID,Title,Due Date,Amount,Description,Dependencies\n';
        milestones.forEach(milestone => {
          const dueDate = milestone.dueDate ? formatDate(milestone.dueDate) : '';
          const amount = milestone.amount || 0;
          const description = (milestone.description || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/"/g, '""');
          const dependencies = milestone.dependencies ? milestone.dependencies.join('; ') : '';
          csvContent += `"${milestone.id || ''}","${milestone.title}","${dueDate}",${amount},"${description}","${dependencies}"\n`;
        });
      }
      
      zip.file(`${sanitizeFilename(projectData.title)}_export.csv`, csvContent);
      
      // Generate and download zip
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadFile(blob, `${sanitizeFilename(projectData.title)}_complete.zip`);
      
      alert('All formats exported successfully!');
    } else {
      throw new Error('JSZip library not available');
    }
  } catch (error) {
    console.error('Failed to export all formats:', error);
    alert('Bulk export requires JSZip library. Please export formats individually or add JSZip to your project:\n\nnpm install jszip\n\nThen import it in your HTML:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>');
  }
};

/**
 * Generate a summary report of the project
 */
export const generateProjectReport = (projectData: ProjectData): string => {
  const budgetCalc = calculateBudgetTotals(projectData);
  const milestones = projectData.timeline.milestones || [];
  
  const completedMilestones = milestones.filter(m => {
    if (m.dueDate) {
      return new Date(m.dueDate) < new Date();
    }
    return false;
  });
  
  const upcomingMilestones = milestones.filter(m => {
    if (m.dueDate) {
      return new Date(m.dueDate) >= new Date();
    }
    return true;
  });
  
  return `
Project Report: ${projectData.title}
${'='.repeat(50)}

Status: ${projectData.status.toUpperCase()}
Category: ${projectData.category || 'Not specified'}

Budget Summary:
- Base Budget: ${formatCurrency(budgetCalc.baseAmount, budgetCalc.currency)}
- Platform Fee: ${formatCurrency(budgetCalc.platformFeeAmount, budgetCalc.currency)}
- Tax: ${formatCurrency(budgetCalc.taxAmount, budgetCalc.currency)}
- Total: ${formatCurrency(budgetCalc.totalAmount, budgetCalc.currency)}

Timeline:
- Start: ${projectData.timeline.startDate ? formatDate(projectData.timeline.startDate) : 'Not set'}
- End: ${projectData.timeline.endDate ? formatDate(projectData.timeline.endDate) : 'Not set'}

Milestones Overview:
- Total: ${milestones.length}
- Completed/Past Due: ${completedMilestones.length}
- Upcoming: ${upcomingMilestones.length}

Skills Required: ${projectData.skills.length}
Attachments: ${projectData.attachments?.length || 0}

Report Generated: ${formatDate(new Date())}
  `.trim();
};

/**
 * Validate project data for export
 */
export const validateProjectForExport = (projectData: ProjectData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!projectData.title || projectData.title.trim() === '') {
    errors.push('Project title is required');
  }
  
  if (!projectData.description || projectData.description.trim() === '') {
    errors.push('Project description is required');
  }
  
  if (!projectData.category || projectData.category.trim() === '') {
    warnings.push('Project category is not specified');
  }
  
  // Budget validation
  if (!projectData.budget || projectData.budget.amount <= 0) {
    errors.push('Project budget must be greater than 0');
  }
  
  // Skills validation
  if (!projectData.skills || projectData.skills.length === 0) {
    warnings.push('No skills specified for the project');
  }
  
  // Timeline validation
  if (projectData.timeline.startDate && projectData.timeline.endDate) {
    const start = new Date(projectData.timeline.startDate);
    const end = new Date(projectData.timeline.endDate);
    
    if (end < start) {
      errors.push('End date cannot be before start date');
    }
  }
  
  // Milestones validation
  if (projectData.timeline.milestones && projectData.timeline.milestones.length > 0) {
    const budgetCalc = calculateBudgetTotals(projectData);
    
    projectData.timeline.milestones.forEach((milestone, index) => {
      if (!milestone.title || milestone.title.trim() === '') {
        errors.push(`Milestone ${index + 1} is missing a title`);
      }
      
      if (milestone.dueDate && projectData.timeline.endDate) {
        const milestoneDate = new Date(milestone.dueDate);
        const projectEnd = new Date(projectData.timeline.endDate);
        
        if (milestoneDate > projectEnd) {
          warnings.push(`Milestone "${milestone.title}" due date is after project end date`);
        }
      }
    });
    
    // Check if milestone total exceeds budget
    if (Math.abs(budgetCalc.milestoneTotalAmount - budgetCalc.baseAmount) > 0.01) {
      if (budgetCalc.milestoneTotalAmount > budgetCalc.baseAmount) {
        warnings.push(`Total milestone payments (${formatCurrency(budgetCalc.milestoneTotalAmount, budgetCalc.currency)}) exceed base budget`);
      } else {
        warnings.push(`Total milestone payments (${formatCurrency(budgetCalc.milestoneTotalAmount, budgetCalc.currency)}) are less than base budget`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};