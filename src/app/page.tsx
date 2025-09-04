'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadAndProcessData, ProcessedData, convertStatusDistribution, convertUserActivity } from '@/lib/dataProcessor';
import apiClient from '@/lib/apiClient';
import StatsCards from '@/components/StatsCards';
import ExecutionTimeChart from '@/components/ExecutionTimeChart';
import StatusDistributionChart from '@/components/StatusDistributionChart';
import UserActivityChart from '@/components/UserActivityChart';
import FinancialSummaryChart from '@/components/FinancialSummaryChart';
import WeeklyUsageChart from '@/components/WeeklyUsageChart';
import DashboardFilters from '@/components/DashboardFilters';
import InsightCards from '@/components/InsightCards';
import { BarChart3, Loader2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{usernames: string[], statuses: string[]}>({
    usernames: [],
    statuses: []
  });
  // Initialize filters from URL parameters
  const [currentFilters, setCurrentFilters] = useState<{
    start_date?: string;
    end_date?: string;
    username?: string;
    status?: string;
    min_execution_time?: number;
    max_execution_time?: number;
  }>(() => {
    return {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      username: searchParams.get('username') || undefined,
      status: searchParams.get('status') || undefined,
      min_execution_time: searchParams.get('min_execution_time') ? Number(searchParams.get('min_execution_time')) : undefined,
      max_execution_time: searchParams.get('max_execution_time') ? Number(searchParams.get('max_execution_time')) : undefined,
    };
  });

  // Load data with initial filters on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overview, weeklyUsage, executionTimeTrends, statusDistribution, userActivity, financialData, options] = await Promise.all([
          apiClient.getDashboardOverview(currentFilters),
          apiClient.getWeeklyUsage(12, currentFilters),
          apiClient.getExecutionTimeTrends(30, currentFilters),
          apiClient.getStatusDistribution(currentFilters),
          apiClient.getUserActivity(currentFilters),
          apiClient.getFinancialData(currentFilters),
          apiClient.getFilterOptions()
        ]);
        
        setData({ overview, weeklyUsage, executionTimeTrends, statusDistribution, userActivity, financialData });
        setFilterOptions(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only run on mount, not when currentFilters changes

  const handleFiltersChange = async (filters: {
    start_date?: string;
    end_date?: string;
    username?: string;
    status?: string;
    min_execution_time?: number;
    max_execution_time?: number;
  }) => {
    try {
      setLoading(true);
      setCurrentFilters(filters);
      
      // Update URL with filter parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });
      
      const newUrl = params.toString() ? `/?${params.toString()}` : '/';
      router.replace(newUrl, { scroll: false });
      
      // Load filtered data...
      const [overview, weeklyUsage, executionTimeTrends, statusDistribution, userActivity, financialData] = await Promise.all([
        apiClient.getDashboardOverview(filters),
        apiClient.getWeeklyUsage(12, filters),
        apiClient.getExecutionTimeTrends(30, filters),
        apiClient.getStatusDistribution(filters),
        apiClient.getUserActivity(filters),
        apiClient.getFinancialData(filters)
      ]);

      setData({ overview, weeklyUsage, executionTimeTrends, statusDistribution, userActivity, financialData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const exportUrl = `${apiClient.baseUrl}/export/csv`;
      window.open(exportUrl, '_blank');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
              <p className="text-gray-600 mb-4">Processing your data...</p>
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
              <p className="text-gray-600">Please check your data source and try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">Real-time insights and performance metrics</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Last updated</div>
              <div className="text-sm text-gray-500">{data.overview.last_updated ? new Date(data.overview.last_updated).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <DashboardFilters
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          usernames={filterOptions.usernames}
          statuses={filterOptions.statuses}
          initialFilters={currentFilters}  // Add this prop
        />

        {/* Stats Cards - Performance Insights, Task Distribution, Top Users */}
        <StatsCards 
          totalTasks={data.overview.total_tasks} 
          executionTimeStats={{
            average: data.overview.avg_execution_time,
            min: data.overview.min_execution_time,
            max: data.overview.max_execution_time,
            median: data.overview.avg_execution_time // Use avg as median approximation
          }}
          statusDistribution={data.statusDistribution.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {} as Record<string, number>)}
          userActivity={data.userActivity.reduce((acc, user) => {
            acc[user.username] = user.task_count;
            return acc;
          }, {} as Record<string, number>)}
        />

        

        {/* Weekly Usage Chart */}
        <div className="mb-8">
          <WeeklyUsageChart data={data.weeklyUsage} width={1200} height={400} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Execution Time Trends */}
          <ExecutionTimeChart 
            data={data.executionTimeTrends} 
            height={400}
          />
          
          {/* Status Distribution Chart */}
          <StatusDistributionChart data={convertStatusDistribution(data.statusDistribution)} width={500} height={400} />
        </div>

        {/* User Activity Chart */}
        <div className="mb-8">
          <UserActivityChart data={convertUserActivity(data.userActivity)} width={900} height={400} />
        </div>

        {/* Financial Summary Chart */}
        <div className="mb-8">
          <FinancialSummaryChart data={data.financialData} width={1000} height={500} />
        </div>

        {/* Insight Cards */}
        <InsightCards 
          executionTimeStats={{
            min: data.overview.min_execution_time,
            max: data.overview.max_execution_time,
            median: data.overview.avg_execution_time
          }}
          statusDistribution={data.statusDistribution.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {} as Record<string, number>)}
          userActivity={data.userActivity.reduce((acc, user) => {
            acc[user.username] = user.task_count;
            return acc;
          }, {} as Record<string, number>)}
        />
      </main>

      {/* Enhanced Footer */}
      <footer className="mt-20 relative">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 backdrop-blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        
        <div className="relative border-t border-gradient-to-r from-transparent via-gray-200/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Main Footer Content */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
              {/* Brand Section */}
              <div className="flex items-center group">
                <div className="p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl mr-5 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h3>
                  <p className="text-gray-600 mt-1">Powerful insights, beautiful visualizations</p>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {data.overview.total_tasks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Total Tasks</div>
                    <div className="w-full bg-blue-100 rounded-full h-1 mt-3">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center group">
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {data.overview.completion_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Success Rate</div>
                    <div className="w-full bg-emerald-100 rounded-full h-1 mt-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-1 rounded-full" 
                           style={{ width: `${data.overview.completion_rate}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center group col-span-2 lg:col-span-1">
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {data.overview.unique_users}
                    </div>
                    <div className="text-sm text-gray-600 font-medium mt-1">Active Users</div>
                    <div className="w-full bg-purple-100 rounded-full h-1 mt-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300/50 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-200/50 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 font-medium">
                  Built with <span className="text-red-500">❤️</span> using modern web technologies
                </p>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    React
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    FastAPI
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    D3.js
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    TypeScript
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>© 2025 Analytics Dashboard. All rights reserved.</p>
                <p className="mt-1">Optimized for performance and accessibility.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Loading fallback component
function DashboardFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">Initializing...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}