"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  TrendingUp,
  Users,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Activity,
  Bell,
  Zap,
} from 'lucide-react';

import { useEscrowManagement } from '@/hooks/use-escrow-management';
import { EscrowContract, EscrowStatus, EscrowType } from '@/types/escrow.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

// Import sub-components
import EscrowCreation from './escrow-creation';
import FundManagement from './fund-management';
import EscrowAnalytics from './escrow-analytics';

interface EscrowManagerProps {
  userId?: string;
  projectId?: string;
  onEscrowSelect?: (escrow: EscrowContract) => void;
}

export default function EscrowManager({ userId, projectId, onEscrowSelect }: EscrowManagerProps) {
  const {
    escrows,
    currentEscrow,
    analytics,
    loading,
    error,
    getEscrow,
    getEscrowAnalytics,
    refreshEscrow,
    subscribeToEscrowUpdates,
    unsubscribeFromEscrowUpdates,
  } = useEscrowManagement();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EscrowType | 'all'>('all');
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filter escrows based on search and filters
  const filteredEscrows = escrows.filter(escrow => {
    const matchesSearch = escrow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || escrow.status === statusFilter;
    const matchesType = typeFilter === 'all' || escrow.type === typeFilter;
    const matchesUser = !userId || escrow.clientId === userId || escrow.freelancerId === userId;
    const matchesProject = !projectId || escrow.projectId === projectId;

    return matchesSearch && matchesStatus && matchesType && matchesUser && matchesProject;
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await getEscrowAnalytics();
      } catch (err) {
        console.error('Failed to load escrow analytics:', err);
      }
    };

    loadInitialData();
  }, [getEscrowAnalytics]);

  // Subscribe to real-time updates for selected escrow
  useEffect(() => {
    if (selectedEscrow) {
      subscribeToEscrowUpdates(selectedEscrow.id);
      return () => unsubscribeFromEscrowUpdates(selectedEscrow.id);
    }
  }, [selectedEscrow, subscribeToEscrowUpdates, unsubscribeFromEscrowUpdates]);

  const handleEscrowSelect = async (escrow: EscrowContract) => {
    setSelectedEscrow(escrow);
    onEscrowSelect?.(escrow);
    
    try {
      await getEscrow(escrow.id);
    } catch (err) {
      console.error('Failed to load escrow details:', err);
    }
  };

  const handleRefresh = async () => {
    if (selectedEscrow) {
      await refreshEscrow(selectedEscrow.id);
    }
    await getEscrowAnalytics();
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: EscrowStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
    });
  };

  const getProgressPercentage = (escrow: EscrowContract) => {
    const completedMilestones = escrow.milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / escrow.milestones.length) * 100;
  };

  if (loading && escrows.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#002333]">Escrow Management</h1>
          <p className="text-[#002333]/70 mt-1">
            Secure and transparent escrow services for your projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowCreationModal(true)}
            className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Escrow
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

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#002333]/70">
                  Total Escrows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {analytics.totalEscrows}
                    </div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+{analytics.performanceTrends.length > 0 ? analytics.performanceTrends[analytics.performanceTrends.length - 1].escrowsCreated : 0} this period</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#15949C]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#15949C]" />
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
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {formatCurrency(analytics.totalValue)}
                    </div>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>Avg: {formatCurrency(analytics.averageValue)}</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
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
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {(analytics.completionRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Completion rate</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
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
                  Dispute Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#002333]">
                      {(analytics.disputeRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-amber-600 flex items-center mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Dispute rate</span>
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funds">Fund Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search escrows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EscrowStatus | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EscrowType | 'all')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="deliverable">Deliverable</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Escrows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEscrows.map((escrow, index) => (
                <motion.div
                  key={escrow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedEscrow?.id === escrow.id ? 'ring-2 ring-[#15949C]' : ''
                    }`}
                    onClick={() => handleEscrowSelect(escrow)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-[#002333] line-clamp-1">
                            {escrow.description}
                          </CardTitle>
                          <CardDescription className="text-sm text-[#002333]/70 mt-1">
                            {escrow.id}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEscrowSelect(escrow)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status and Type */}
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(escrow.status)} flex items-center gap-1`}>
                          {getStatusIcon(escrow.status)}
                          {escrow.status}
                        </Badge>
                        <Badge variant="outline" className="text-[#15949C] border-[#15949C]">
                          {escrow.type}
                        </Badge>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#002333]/70">Amount:</span>
                        <span className="text-lg font-bold text-[#002333]">
                          {formatCurrency(escrow.amount, escrow.currency)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#002333]/70">Progress:</span>
                          <span className="font-medium text-[#002333]">
                            {escrow.milestones.filter(m => m.status === 'completed').length} / {escrow.milestones.length} milestones
                          </span>
                        </div>
                        <Progress value={getProgressPercentage(escrow)} className="h-2" />
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm text-[#002333]/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {formatDate(escrow.createdAt)}</span>
                        </div>
                        {escrow.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Expires: {formatDate(escrow.expiresAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEscrowSelect(escrow);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {escrow.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle fund release
                            }}
                          >
                            <Unlock className="h-4 w-4 mr-1" />
                            Release
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredEscrows.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-[#002333] mb-2">No Escrows Found</h3>
                <p className="text-[#002333]/70 text-center mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No escrows match your current filters. Try adjusting your search criteria.'
                    : 'You don\'t have any escrows yet. Create your first escrow to get started.'}
                </p>
                <Button
                  onClick={() => setShowCreationModal(true)}
                  className="bg-[#15949C] hover:bg-[#15949C]/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Escrow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="funds">
          <FundManagement 
            escrow={selectedEscrow}
            onEscrowSelect={handleEscrowSelect}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <EscrowAnalytics 
            analytics={analytics}
            escrows={escrows}
            onEscrowSelect={handleEscrowSelect}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Settings</CardTitle>
              <CardDescription>
                Configure your escrow preferences and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#002333] mb-2">Settings Coming Soon</h3>
                  <p className="text-[#002333]/70">
                    Advanced escrow settings and configuration options will be available here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Creation Modal */}
      {showCreationModal && (
        <EscrowCreation
          onClose={() => setShowCreationModal(false)}
          onSuccess={(escrow) => {
            setShowCreationModal(false);
            handleEscrowSelect(escrow);
          }}
        />
      )}
    </div>
  );
}
