"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  FileText,
  Users,
  Activity,
  BarChart3,
  Filter,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
} from 'lucide-react';

import { useEscrowManagement } from '@/hooks/use-escrow-management';
import { EscrowContract, EscrowFundManagement, FundTransaction } from '@/types/escrow.types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface FundManagementProps {
  escrow?: EscrowContract | null;
  onEscrowSelect?: (escrow: EscrowContract) => void;
}

export default function FundManagement({ escrow, onEscrowSelect }: FundManagementProps) {
  const {
    fundManagement,
    loading,
    error,
    getFundManagement,
    releaseFunds,
    refreshEscrow,
    canReleaseFunds,
  } = useEscrowManagement();

  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(escrow || null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseAmount, setReleaseAmount] = useState(0);
  const [releaseReason, setReleaseReason] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load fund management data when escrow is selected
  useEffect(() => {
    if (selectedEscrow) {
      getFundManagement(selectedEscrow.id);
    }
  }, [selectedEscrow, getFundManagement]);

  // Update selected escrow when prop changes
  useEffect(() => {
    if (escrow) {
      setSelectedEscrow(escrow);
    }
  }, [escrow]);

  const handleReleaseFunds = async () => {
    if (!selectedEscrow || !releaseAmount) return;

    try {
      await releaseFunds({
        contractId: selectedEscrow.id,
        signer: 'current-user', // This should come from auth context
        amount: releaseAmount,
        milestoneId: selectedMilestone || undefined,
        reason: releaseReason,
      });

      setShowReleaseModal(false);
      setReleaseAmount(0);
      setReleaseReason('');
      setSelectedMilestone('');
      
      // Refresh fund management data
      await getFundManagement(selectedEscrow.id);
    } catch (err) {
      console.error('Failed to release funds:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'release': return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      case 'refund': return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      case 'fee': return <DollarSign className="h-4 w-4 text-gray-600" />;
      case 'dispute_hold': return <Lock className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600';
      case 'release': return 'text-blue-600';
      case 'refund': return 'text-orange-600';
      case 'fee': return 'text-gray-600';
      case 'dispute_hold': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter transactions
  const filteredTransactions = fundManagement?.fundHistory.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  if (!selectedEscrow) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-[#002333] mb-2">No Escrow Selected</h3>
          <p className="text-[#002333]/70 text-center mb-4">
            Select an escrow contract to view and manage its funds.
          </p>
          <Button onClick={() => onEscrowSelect?.(selectedEscrow!)}>
            <Eye className="h-4 w-4 mr-2" />
            Select Escrow
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !fundManagement) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002333]">Fund Management</h2>
          <p className="text-[#002333]/70 mt-1">
            Monitor and manage escrow funds for: {selectedEscrow.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => getFundManagement(selectedEscrow.id)}
            disabled={loading}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowReleaseModal(true)}
            disabled={!canReleaseFunds(selectedEscrow.id)}
            className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
          >
            <Unlock className="h-4 w-4 mr-2" />
            Release Funds
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Fund Overview Cards */}
      {fundManagement && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#002333]/70">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {formatCurrency(fundManagement.totalAmount, fundManagement.currency)}
                    </div>
                    <p className="text-xs text-[#002333]/70 mt-1">
                      Initial escrow amount
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#15949C]/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#15949C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#002333]/70">
                  Released Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {formatCurrency(fundManagement.releasedAmount, fundManagement.currency)}
                    </div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>{((fundManagement.releasedAmount / fundManagement.totalAmount) * 100).toFixed(1)}% released</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Unlock className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#002333]/70">
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {formatCurrency(fundManagement.availableBalance, fundManagement.currency)}
                    </div>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>Ready for release</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#002333]/70">
                  Locked Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {formatCurrency(fundManagement.lockedBalance, fundManagement.currency)}
                    </div>
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <Lock className="h-3 w-3 mr-1" />
                      <span>Secured in escrow</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Fund Progress */}
      {fundManagement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#15949C]" />
              Fund Distribution
            </CardTitle>
            <CardDescription>
              Visual breakdown of escrow fund allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#002333]">Released Funds</span>
                <span className="text-sm text-[#002333]/70">
                  {formatCurrency(fundManagement.releasedAmount, fundManagement.currency)}
                </span>
              </div>
              <Progress 
                value={(fundManagement.releasedAmount / fundManagement.totalAmount) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#002333]">Available Balance</span>
                <span className="text-sm text-[#002333]/70">
                  {formatCurrency(fundManagement.availableBalance, fundManagement.currency)}
                </span>
              </div>
              <Progress 
                value={(fundManagement.availableBalance / fundManagement.totalAmount) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#002333]">Locked Balance</span>
                <span className="text-sm text-[#002333]/70">
                  {formatCurrency(fundManagement.lockedBalance, fundManagement.currency)}
                </span>
              </div>
              <Progress 
                value={(fundManagement.lockedBalance / fundManagement.totalAmount) * 100} 
                className="h-2"
              />
            </div>

            {fundManagement.disputedAmount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#002333]">Disputed Amount</span>
                  <span className="text-sm text-[#002333]/70">
                    {formatCurrency(fundManagement.disputedAmount, fundManagement.currency)}
                  </span>
                </div>
                <Progress 
                  value={(fundManagement.disputedAmount / fundManagement.totalAmount) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#15949C]" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Complete history of all fund transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="release">Releases</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
                <SelectItem value="fee">Fees</SelectItem>
                <SelectItem value="dispute_hold">Dispute Holds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {transaction.description}
                      </div>
                      {transaction.milestoneId && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Milestone: {transaction.milestoneId}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-[#002333]/70">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs text-[#002333]/70">
                        {transaction.transactionId ? 
                          transaction.transactionId.slice(0, 8) + '...' : 
                          'N/A'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#002333] mb-2">No Transactions Found</h3>
              <p className="text-[#002333]/70">
                {searchTerm || filterType !== 'all' 
                  ? 'No transactions match your current filters.'
                  : 'No transactions have been recorded yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Release Funds Modal */}
      <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-[#15949C]" />
              Release Funds
            </DialogTitle>
            <DialogDescription>
              Release funds from the escrow contract. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="releaseAmount">Amount to Release</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="releaseAmount"
                  type="number"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-10"
                  max={fundManagement?.availableBalance || 0}
                />
              </div>
              <p className="text-xs text-[#002333]/70">
                Available: {formatCurrency(fundManagement?.availableBalance || 0, fundManagement?.currency)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone">Milestone (Optional)</Label>
              <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific milestone</SelectItem>
                  {selectedEscrow.milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseReason">Reason for Release</Label>
              <Input
                id="releaseReason"
                value={releaseReason}
                onChange={(e) => setReleaseReason(e.target.value)}
                placeholder="Enter reason for fund release..."
              />
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important</AlertTitle>
              <AlertDescription className="text-amber-700">
                This action will release funds from the escrow contract. Make sure you have the proper authorization and that all conditions are met.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReleaseModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReleaseFunds}
              disabled={!releaseAmount || releaseAmount > (fundManagement?.availableBalance || 0)}
              className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Release Funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
