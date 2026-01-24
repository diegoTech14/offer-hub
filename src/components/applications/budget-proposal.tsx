'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type {
  BudgetProposal,
  PricingModel,
  Currency,
  Milestone,
  BudgetCalculation,
} from '@/types/application-form.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Clock,
  Target,
  Plus,
  Trash2,
  Info,
  Calculator,
  ArrowRight,
} from 'lucide-react';

interface BudgetProposalProps {
  budget: Partial<BudgetProposal>;
  onChange: (budget: BudgetProposal) => void;
  onCalculate?: (calculation: BudgetCalculation) => void;
  className?: string;
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'XLM', label: 'Stellar Lumens', symbol: 'XLM' },
  { value: 'USDT', label: 'Tether', symbol: 'USDT' },
];

const PLATFORM_FEE = 10; // 10%

export function BudgetProposal({
  budget,
  onChange,
  onCalculate,
  className = '',
}: BudgetProposalProps) {
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    budget.pricingModel || 'fixed'
  );
  const [currency, setCurrency] = useState<Currency>(budget.currency || 'USD');
  const [calculation, setCalculation] = useState<BudgetCalculation | null>(null);

  const currencySymbol =
    CURRENCIES.find((c) => c.value === currency)?.symbol || '$';

  const calculateTotal = useCallback(() => {
    let total = 0;

    if (pricingModel === 'hourly' && budget.hourlyRate && budget.estimatedHours) {
      total = budget.hourlyRate * budget.estimatedHours;
    } else if (pricingModel === 'fixed' && budget.fixedAmount) {
      total = budget.fixedAmount;
    } else if (pricingModel === 'milestone' && budget.milestones) {
      total = budget.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    }

    const platformFee = total * (PLATFORM_FEE / 100);
    const processingFee = total * 0.029; // 2.9%
    const tax = budget.taxIncluded ? 0 : total * 0.1;
    const clientPays = total + platformFee + processingFee + tax;
    const freelancerReceives = total - platformFee;

    const calc: BudgetCalculation = {
      subtotal: total,
      platformFee,
      processingFee,
      tax,
      total: clientPays,
      freelancerReceives,
      clientPays,
    };

    setCalculation(calc);
    if (onCalculate) {
      onCalculate(calc);
    }

    return total;
  }, [pricingModel, budget, onCalculate]);

  const updateBudget = useCallback(
    (updates: Partial<BudgetProposal>) => {
      const total = calculateTotal();
      const newBudget: BudgetProposal = {
        ...budget,
        ...updates,
        pricingModel,
        currency,
        totalAmount: total,
      } as BudgetProposal;

      onChange(newBudget);
    },
    [budget, pricingModel, currency, onChange, calculateTotal]
  );

  const handlePricingModelChange = useCallback(
    (model: PricingModel) => {
      setPricingModel(model);
      updateBudget({ pricingModel: model });
    },
    [updateBudget]
  );

  const handleCurrencyChange = useCallback(
    (curr: Currency) => {
      setCurrency(curr);
      updateBudget({ currency: curr });
    },
    [updateBudget]
  );

  const addMilestone = useCallback(() => {
    const currentMilestones = budget.milestones || [];
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: '',
      description: '',
      amount: 0,
      duration: 7,
      deliverables: [],
      order: currentMilestones.length + 1,
    };
    updateBudget({ milestones: [...currentMilestones, newMilestone] });
  }, [budget.milestones, updateBudget]);

  const updateMilestone = useCallback(
    (index: number, updates: Partial<Milestone>) => {
      const milestones = [...(budget.milestones || [])];
      milestones[index] = { ...milestones[index], ...updates };
      updateBudget({ milestones });
    },
    [budget.milestones, updateBudget]
  );

  const removeMilestone = useCallback(
    (index: number) => {
      const milestones = (budget.milestones || []).filter((_, i) => i !== index);
      updateBudget({ milestones });
    },
    [budget.milestones, updateBudget]
  );

  const addBreakdownItem = useCallback(() => {
    const currentBreakdown = budget.breakdown || [];
    updateBudget({
      breakdown: [...currentBreakdown, { description: '', amount: 0 }],
    });
  }, [budget.breakdown, updateBudget]);

  const updateBreakdownItem = useCallback(
    (index: number, field: 'description' | 'amount', value: string | number) => {
      const breakdown = [...(budget.breakdown || [])];
      breakdown[index] = { ...breakdown[index], [field]: value };
      updateBudget({ breakdown });
    },
    [budget.breakdown, updateBudget]
  );

  const removeBreakdownItem = useCallback(
    (index: number) => {
      const breakdown = (budget.breakdown || []).filter((_, i) => i !== index);
      updateBudget({ breakdown });
    },
    [budget.breakdown, updateBudget]
  );

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Budget Proposal</h2>
        <p className="text-muted-foreground">
          Define your pricing structure and payment terms
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle className="text-base">Pricing Model</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={pricingModel} onValueChange={(v) => handlePricingModelChange(v as PricingModel)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hourly">
                  <Clock className="mr-2 h-4 w-4" />
                  Hourly
                </TabsTrigger>
                <TabsTrigger value="fixed">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Fixed
                </TabsTrigger>
                <TabsTrigger value="milestone">
                  <Target className="mr-2 h-4 w-4" />
                  Milestone
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle className="text-base">Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currency} onValueChange={(v) => handleCurrencyChange(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.symbol} {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {pricingModel === 'hourly' && (
        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle>Hourly Rate Details</CardTitle>
            <CardDescription>
              Specify your hourly rate and estimated hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ({currencySymbol})</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={budget.hourlyRate || ''}
                  onChange={(e) =>
                    updateBudget({ hourlyRate: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="50"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={budget.estimatedHours || ''}
                  onChange={(e) =>
                    updateBudget({ estimatedHours: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="40"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {budget.hourlyRate && budget.estimatedHours && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Total</span>
                  <span className="text-2xl font-bold">
                    {currencySymbol}
                    {(budget.hourlyRate * budget.estimatedHours).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {pricingModel === 'fixed' && (
        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <CardTitle>Fixed Price Details</CardTitle>
            <CardDescription>
              Specify your fixed project price
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fixedAmount">Project Price ({currencySymbol})</Label>
              <Input
                id="fixedAmount"
                type="number"
                value={budget.fixedAmount || ''}
                onChange={(e) =>
                  updateBudget({ fixedAmount: parseFloat(e.target.value) || 0 })
                }
                placeholder="2000"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cost Breakdown (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBreakdownItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {(budget.breakdown || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updateBreakdownItem(index, 'description', e.target.value)
                    }
                    placeholder="Item description"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={item.amount || ''}
                    onChange={(e) =>
                      updateBreakdownItem(index, 'amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Amount"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBreakdownItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pricingModel === 'milestone' && (
        <Card className='hover:scale-100 hover:shadow-none border'>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Milestone-Based Pricing</CardTitle>
                <CardDescription>
                  Break down the project into milestones with payments
                </CardDescription>
              </div>
              <Button type="button" onClick={addMilestone} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(budget.milestones || []).length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No milestones added yet. Add milestones to structure your project payment.
              </div>
            ) : (
              (budget.milestones || []).map((milestone, index) => (
                <Card key={milestone.id} className="border-dashed">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge>Milestone {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Milestone Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(index, { title: e.target.value })
                        }
                        placeholder="e.g., Initial Design & Wireframes"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) =>
                          updateMilestone(index, { description: e.target.value })
                        }
                        placeholder="Describe what will be delivered in this milestone"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Amount ({currencySymbol})</Label>
                        <Input
                          type="number"
                          value={milestone.amount || ''}
                          onChange={(e) =>
                            updateMilestone(index, {
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (days)</Label>
                        <Input
                          type="number"
                          value={milestone.duration || ''}
                          onChange={(e) =>
                            updateMilestone(index, {
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="7"
                          min="1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {(budget.milestones || []).length > 0 && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Milestones Amount</span>
                  <span className="text-2xl font-bold">
                    {currencySymbol}
                    {(budget.milestones || [])
                      .reduce((sum, m) => sum + (m.amount || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className='hover:scale-100 hover:shadow-none border'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Additional Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tax Included</Label>
              <p className="text-sm text-muted-foreground">
                Is tax already included in your pricing?
              </p>
            </div>
            <Switch
              checked={budget.taxIncluded || false}
              onCheckedChange={(checked) => updateBudget({ taxIncluded: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={budget.notes || ''}
              onChange={(e) => updateBudget({ notes: e.target.value })}
              placeholder="Any additional notes about pricing, payment terms, etc."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {calculation && (
        <Card className="bg-primary/5 border-primary/20 hover:scale-100 hover:shadow-none border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">
                {currencySymbol}{calculation.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee ({PLATFORM_FEE}%)</span>
              <span>-{currencySymbol}{calculation.platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing Fee (2.9%)</span>
              <span>{currencySymbol}{calculation.processingFee.toFixed(2)}</span>
            </div>
            {calculation.tax > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax (10%)</span>
                <span>{currencySymbol}{calculation.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>You Receive</span>
                <span className="text-green-600">
                  {currencySymbol}{calculation.freelancerReceives.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Client Pays</span>
                <span>{currencySymbol}{calculation.clientPays.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

