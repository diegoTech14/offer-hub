'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ProposalContent, ProposalTemplate } from '@/types/application-form.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { getTemplateData } from './proposal-templates';

interface ProposalEditorProps {
  templateType?: ProposalTemplate;
  coverLetter?: string;
  onCoverLetterChange?: (coverLetter: string) => void;
  className?: string;
}

// Smart template content with editable placeholders
const getTemplateContent = (templateType: ProposalTemplate): string => {
  const templates = {
    standard: `
<h2>Dear [Client Name],</h2>

<p>I am excited to apply for <strong>[Project Name]</strong>. With my extensive experience in <strong>[Your Expertise]</strong>, I am confident I can deliver exceptional results for your project.</p>

<h3>Understanding Your Needs</h3>
<p>I understand you need <strong>[What they need]</strong>. My approach will focus on <strong>[Your approach]</strong> to ensure we achieve your goals efficiently.</p>

<h3>My Approach</h3>
<p>I will start by <strong>[First step]</strong>, then proceed to <strong>[Second step]</strong>, and finally <strong>[Final step]</strong>.</p>

<h3>Why Choose Me</h3>
<p>I am uniquely qualified because:</p>
<ul>
  <li><strong>[Your key strength 1]</strong> - [Brief explanation]</li>
  <li><strong>[Your key strength 2]</strong> - [Brief explanation]</li>
  <li><strong>[Years of experience]</strong> in [relevant field]</li>
</ul>

<h3>Deliverables</h3>
<p>I will deliver:</p>
<ul>
  <li>[Deliverable 1]</li>
  <li>[Deliverable 2]</li>
  <li>[Deliverable 3]</li>
</ul>

<p>I'm available to start <strong>[When you can start]</strong> and can commit <strong>[Hours per week]</strong> hours per week to this project.</p>

<p>I look forward to discussing how I can help bring your vision to life!</p>

<p>Best regards,<br>
<strong>[Your Name]</strong></p>`,
    
    technical: `
<h2>Technical Proposal: [Project Name]</h2>

<p>Dear [Client Name],</p>

<p>Thank you for considering my application for your <strong>[Project Type]</strong> project. As a <strong>[Your Role]</strong> with <strong>[Years]</strong> years of experience, I'm excited to contribute to your technical goals.</p>

<h3>Technical Understanding</h3>
<p>Based on your requirements, I understand you need a solution that:</p>
<ul>
  <li>[Requirement 1]</li>
  <li>[Requirement 2]</li>
  <li>[Requirement 3]</li>
</ul>

<h3>Technology Stack</h3>
<p>I recommend using:</p>
<ul>
  <li><strong>Frontend:</strong> [Technology] for [reason]</li>
  <li><strong>Backend:</strong> [Technology] for [reason]</li>
  <li><strong>Database:</strong> [Technology] for [reason]</li>
</ul>

<h3>Development Approach</h3>
<p>My development methodology includes:</p>
<ol>
  <li><strong>Planning Phase:</strong> [What you'll do]</li>
  <li><strong>Development Phase:</strong> [Your process]</li>
  <li><strong>Testing Phase:</strong> [Testing approach]</li>
  <li><strong>Deployment Phase:</strong> [How you'll deploy]</li>
</ol>

<h3>Expected Deliverables</h3>
<ul>
  <li>[Technical deliverable 1]</li>
  <li>[Technical deliverable 2]</li>
  <li>[Documentation and code]</li>
</ul>

<p>I can start <strong>[Start date]</strong> and complete the project within <strong>[Timeline]</strong>.</p>

<p>Best regards,<br>
<strong>[Your Name]</strong></p>`,

    creative: `
<h2>Creative Proposal: [Project Name]</h2>

<p>Hello [Client Name],</p>

<p>I'm thrilled to apply for your <strong>[Project Type]</strong> project! As a creative professional with <strong>[Years]</strong> years of experience in <strong>[Your Creative Field]</strong>, I'm passionate about bringing your vision to life.</p>

<h3>Creative Vision</h3>
<p>I envision your project as <strong>[Your creative vision]</strong>. My approach will focus on <strong>[Creative approach]</strong> to create something truly memorable.</p>

<h3>Design Approach</h3>
<p>My creative process includes:</p>
<ul>
  <li><strong>Discovery:</strong> Understanding your brand and goals</li>
  <li><strong>Concept Development:</strong> Creating initial concepts</li>
  <li><strong>Refinement:</strong> Iterating based on feedback</li>
  <li><strong>Final Delivery:</strong> High-quality final assets</li>
</ul>

<h3>Style & Aesthetic</h3>
<p>I'll create designs that are:</p>
<ul>
  <li><strong>[Style characteristic 1]</strong></li>
  <li><strong>[Style characteristic 2]</strong></li>
  <li><strong>[Style characteristic 3]</strong></li>
</ul>

<h3>Portfolio Highlights</h3>
<p>My relevant work includes <strong>[Similar project 1]</strong> and <strong>[Similar project 2]</strong>, which demonstrate my ability to [relevant skill].</p>

<h3>Deliverables</h3>
<ul>
  <li>[Creative deliverable 1]</li>
  <li>[Creative deliverable 2]</li>
  <li>[Creative deliverable 3]</li>
</ul>

<p>I'm available to start <strong>[Start date]</strong> and can dedicate <strong>[Hours]</strong> hours per week to this project.</p>

<p>Let's create something amazing together!</p>

<p>Best,<br>
<strong>[Your Name]</strong></p>`,

    consulting: `
<h2>Consulting Proposal: [Project Name]</h2>

<p>Dear [Client Name],</p>

<p>Thank you for the opportunity to propose a solution for your <strong>[Business Challenge]</strong>. As a <strong>[Your Role]</strong> with <strong>[Years]</strong> years of experience in <strong>[Industry]</strong>, I'm confident I can help you achieve your objectives.</p>

<h3>Problem Analysis</h3>
<p>Based on your description, I understand you're facing:</p>
<ul>
  <li><strong>[Challenge 1]:</strong> [Brief analysis]</li>
  <li><strong>[Challenge 2]:</strong> [Brief analysis]</li>
  <li><strong>[Challenge 3]:</strong> [Brief analysis]</li>
</ul>

<h3>Proposed Solution</h3>
<p>My recommended approach includes:</p>
<ol>
  <li><strong>[Solution step 1]:</strong> [What you'll do]</li>
  <li><strong>[Solution step 2]:</strong> [What you'll do]</li>
  <li><strong>[Solution step 3]:</strong> [What you'll do]</li>
</ol>

<h3>Methodology</h3>
<p>I'll use a structured approach that includes:</p>
<ul>
  <li>Initial assessment and data gathering</li>
  <li>Strategy development and planning</li>
  <li>Implementation support</li>
  <li>Monitoring and optimization</li>
</ul>

<h3>Expected Outcomes</h3>
<p>By the end of our engagement, you can expect:</p>
<ul>
  <li>[Expected outcome 1]</li>
  <li>[Expected outcome 2]</li>
  <li>[Expected outcome 3]</li>
</ul>

<h3>Experience & Credentials</h3>
<p>My relevant experience includes:</p>
<ul>
  <li><strong>[Relevant experience 1]</strong></li>
  <li><strong>[Relevant experience 2]</strong></li>
  <li><strong>[Certification or achievement]</strong></li>
</ul>

<p>I can start <strong>[Start date]</strong> and complete the project within <strong>[Timeline]</strong>.</p>

<p>Best regards,<br>
<strong>[Your Name]</strong></p>`,

    custom: `
<h2>[Project Name] Proposal</h2>

<p>Dear [Client Name],</p>

<p>I am excited to apply for your <strong>[Project Type]</strong> project. With my experience in <strong>[Your Field]</strong>, I'm confident I can deliver excellent results.</p>

<h3>Understanding Your Needs</h3>
<p>[Write about what you understand they need]</p>

<h3>My Approach</h3>
<p>[Describe your approach to the project]</p>

<h3>Why Choose Me</h3>
<p>[Explain your qualifications and why you're the right fit]</p>

<h3>Deliverables</h3>
<ul>
  <li>[Deliverable 1]</li>
  <li>[Deliverable 2]</li>
  <li>[Deliverable 3]</li>
</ul>

<p>I'm available to start <strong>[Start date]</strong> and can commit <strong>[Hours per week]</strong> hours per week.</p>

<p>Best regards,<br>
<strong>[Your Name]</strong></p>`
  };

  return templates[templateType] || templates.standard;
};

export function ProposalEditor({
  templateType = 'standard',
  coverLetter = '',
  onCoverLetterChange,
  className = '',
}: ProposalEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [hasUsedTemplate, setHasUsedTemplate] = useState(false);

  const template = getTemplateData(templateType);

  // Initialize with template content if empty
  useEffect(() => {
    if (!coverLetter && !hasUsedTemplate) {
      const templateContent = getTemplateContent(templateType);
      onCoverLetterChange?.(templateContent);
      setHasUsedTemplate(true);
    }
  }, [templateType, coverLetter, onCoverLetterChange, hasUsedTemplate]);


  const resetToTemplate = useCallback(() => {
    const templateContent = getTemplateContent(templateType);
    onCoverLetterChange?.(templateContent);
    setHasUsedTemplate(true);
  }, [templateType, onCoverLetterChange]);

  const generateAISuggestion = useCallback(() => {
    alert(`AI suggestion feature coming soon! This will help improve your proposal content.`);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Your Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Using the <strong>{template?.name}</strong> template. Edit the placeholders like <code>[Your Name]</code> with your actual information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToTemplate}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAISuggestion}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assist
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Single Comprehensive Proposal Editor */}
      <Card className='hover:scale-100 hover:shadow-none border-none p-0'>
        <CardContent className="space-y-4">
          <RichTextEditor
            content={coverLetter}
            onChange={onCoverLetterChange}
            placeholder="Start writing your proposal..."
            minHeight="600px"
            showToolbar={true}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{coverLetter.length} characters</span>
            <div className="flex gap-2">
              {coverLetter.length < 100 && (
                <Badge variant="destructive">Too short</Badge>
              )}
              {coverLetter.length >= 100 && coverLetter.length < 300 && (
                <Badge variant="secondary">Could be longer</Badge>
              )}
              {coverLetter.length >= 300 && (
                <Badge variant="default">Good length</Badge>
              )}
              {coverLetter.includes('[Your Name]') && (
                <Badge variant="outline">Remember to replace placeholders</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables Section */}
      <Card className='hover:scale-100 hover:shadow-none'>
        <CardHeader>
          <CardTitle>Project Deliverables</CardTitle>
          <CardDescription>
            List the specific items you will deliver upon project completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {['Fully functional [project type]', 'Source code and documentation', 'Testing and quality assurance', 'User guide and training materials'].map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <div className="w-4 h-4 border rounded-sm" />
                <span className="text-sm">{deliverable}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            💡 These are suggested deliverables. Edit them in your proposal above to match your specific project.
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card className="bg-muted/50 hover:scale-100 hover:shadow-none">
          <CardHeader>
            <CardTitle>Proposal Preview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: coverLetter }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}