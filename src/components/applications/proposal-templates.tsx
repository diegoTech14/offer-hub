/**
 * Proposal Templates Component
 * Professional proposal templates for different project types
 */

'use client';

import React from 'react';
import { ProposalTemplate, ProposalTemplateData } from '@/types/application-form.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Code,
  Palette,
  Lightbulb,
  Briefcase,
  Check,
} from 'lucide-react';

interface ProposalTemplatesProps {
  selectedTemplate?: ProposalTemplate;
  onSelectTemplate: (template: ProposalTemplate) => void;
  className?: string;
}

const TEMPLATE_DATA: ProposalTemplateData[] = [
  {
    id: 'standard',
    name: 'Standard Proposal',
    description: 'General-purpose proposal template suitable for most projects',
    icon: 'FileText',
    sections: [
      { title: 'Introduction', placeholder: 'Introduce yourself and express interest...', required: true },
      { title: 'Understanding', placeholder: 'Show your understanding of the project...', required: true },
      { title: 'Approach', placeholder: 'Explain how you will approach the project...', required: true },
      { title: 'Deliverables', placeholder: 'List what you will deliver...', required: true },
      { title: 'Why Me', placeholder: 'Explain why you are the best fit...', required: true },
    ],
    recommendedFor: ['General Projects', 'Small Tasks', 'Quick Jobs'],
  },
  {
    id: 'technical',
    name: 'Technical Proposal',
    description: 'Detailed technical proposal for development and engineering projects',
    icon: 'Code',
    sections: [
      { title: 'Introduction', placeholder: 'Brief introduction and background...', required: true },
      { title: 'Technical Understanding', placeholder: 'Demonstrate technical understanding...', required: true },
      { title: 'Technology Stack', placeholder: 'Outline technologies you will use...', required: true },
      { title: 'Architecture & Design', placeholder: 'Describe system architecture...', required: true },
      { title: 'Development Approach', placeholder: 'Explain development methodology...', required: true },
      { title: 'Testing Strategy', placeholder: 'Describe testing and QA approach...', required: true },
      { title: 'Deliverables', placeholder: 'List technical deliverables...', required: true },
      { title: 'Qualifications', placeholder: 'Highlight relevant experience...', required: true },
    ],
    recommendedFor: ['Software Development', 'Web Development', 'Mobile Apps', 'API Development'],
  },
  {
    id: 'creative',
    name: 'Creative Proposal',
    description: 'Showcases creative vision for design and artistic projects',
    icon: 'Palette',
    sections: [
      { title: 'Introduction', placeholder: 'Share your creative perspective...', required: true },
      { title: 'Creative Vision', placeholder: 'Describe your vision for the project...', required: true },
      { title: 'Design Approach', placeholder: 'Explain your design process...', required: true },
      { title: 'Style & Aesthetic', placeholder: 'Outline the style direction...', required: true },
      { title: 'Deliverables', placeholder: 'List creative deliverables...', required: true },
      { title: 'Portfolio Highlights', placeholder: 'Reference relevant portfolio work...', required: false },
      { title: 'Why My Style Fits', placeholder: 'Explain why your style matches...', required: true },
    ],
    recommendedFor: ['Graphic Design', 'UI/UX Design', 'Branding', 'Illustration'],
  },
  {
    id: 'consulting',
    name: 'Consulting Proposal',
    description: 'Professional consulting proposal for strategic and advisory projects',
    icon: 'Lightbulb',
    sections: [
      { title: 'Executive Summary', placeholder: 'Summarize your proposal...', required: true },
      { title: 'Problem Analysis', placeholder: 'Analyze the current situation...', required: true },
      { title: 'Proposed Solution', placeholder: 'Present your recommended solution...', required: true },
      { title: 'Methodology', placeholder: 'Describe your consulting approach...', required: true },
      { title: 'Expected Outcomes', placeholder: 'Outline expected results...', required: true },
      { title: 'Experience & Credentials', placeholder: 'Highlight relevant experience...', required: true },
      { title: 'Next Steps', placeholder: 'Propose immediate next steps...', required: false },
    ],
    recommendedFor: ['Business Consulting', 'Strategy', 'Marketing', 'Management'],
  },
  {
    id: 'custom',
    name: 'Custom Proposal',
    description: 'Build your own proposal structure from scratch',
    icon: 'Briefcase',
    sections: [
      { title: 'Cover Letter', placeholder: 'Start with your cover letter...', required: true },
      { title: 'Proposal Content', placeholder: 'Add your proposal content...', required: true },
    ],
    recommendedFor: ['Unique Projects', 'Custom Requirements'],
  },
];

const getTemplateIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className="h-8 w-8" />,
    Code: <Code className="h-8 w-8" />,
    Palette: <Palette className="h-8 w-8" />,
    Lightbulb: <Lightbulb className="h-8 w-8" />,
    Briefcase: <Briefcase className="h-8 w-8" />,
  };
  return icons[iconName] || <FileText className="h-8 w-8" />;
};

export function ProposalTemplates({
  selectedTemplate,
  onSelectTemplate,
  className = '',
}: ProposalTemplatesProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Choose a Proposal Template</h2>
        <p className="text-muted-foreground">
          Select a template that best fits your project type. You can customize it later.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_DATA.map((template) => {
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer flex flex-col gap-y-0 min-h-[200px] justify-between transition-all hover:shadow-md hover:scale-100 ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {getTemplateIcon(template.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Sections:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {template.sections.slice(0, 4).map((section, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        {section.title}
                        {section.required && (
                          <span className="text-xs text-destructive">*</span>
                        )}
                      </li>
                    ))}
                    {template.sections.length > 4 && (
                      <li className="text-xs italic">
                        +{template.sections.length - 4} more sections
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recommended for:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.recommendedFor.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Use This Template'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <Card className="bg-muted/50 hover:scale-100 hover:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Template Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Tip:</strong> This template is optimized for{' '}
                {TEMPLATE_DATA.find((t) => t.id === selectedTemplate)?.recommendedFor.join(', ')}.
              </p>
              <p>
                You can edit, add, or remove sections as needed. Required sections are marked with *.
              </p>
              <p className="text-muted-foreground">
                The template will guide you through creating a professional proposal with all necessary
                information.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getTemplateData(templateId: ProposalTemplate): ProposalTemplateData | undefined {
  return TEMPLATE_DATA.find((t) => t.id === templateId);
}

export function getTemplatePlaceholder(
  templateId: ProposalTemplate,
  section: string
): string {
  const template = getTemplateData(templateId);
  const sectionData = template?.sections.find(
    (s) => s.title.toLowerCase() === section.toLowerCase()
  );
  return sectionData?.placeholder || '';
}

