'use client';

import { useEffect, useState } from 'react';
import { loadAndProcessData, ProcessedData } from '@/lib/dataProcessor';
import StatsCards from '@/components/StatsCards';
import ExecutionTimeChart from '@/components/ExecutionTimeChart';
import StatusDistributionChart from '@/components/StatusDistributionChart';
import UserActivityChart from '@/components/UserActivityChart';
import FinancialSummaryChart from '@/components/FinancialSummaryChart';
import { BarChart3, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const processedData = await loadAndProcessData();
        setData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              <div className="text-sm text-gray-500">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards
          tasks={data.tasks}
          executionTimeStats={data.executionTimeStats}
          statusDistribution={data.statusDistribution}
          userActivity={data.userActivity}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Execution Time Chart */}
          <ExecutionTimeChart data={data.tasks} width={600} height={400} />
          
          {/* Status Distribution Chart */}
          <StatusDistributionChart data={data.statusDistribution} width={500} height={400} />
        </div>

        {/* User Activity Chart */}
        <div className="mb-8">
          <UserActivityChart data={data.userActivity} width={900} height={400} />
        </div>

        {/* Financial Summary Chart */}
        <div className="mb-8">
          <FinancialSummaryChart data={data.financialData} width={1000} height={500} />
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Performance Insights</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <span className="text-gray-700 font-medium">Fastest Task</span>
                <span className="font-bold text-emerald-600 text-lg">{data.executionTimeStats.min.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">Slowest Task</span>
                <span className="font-bold text-orange-600 text-lg">{data.executionTimeStats.max.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-gray-700 font-medium">Median Time</span>
                <span className="font-bold text-blue-600 text-lg">{data.executionTimeStats.median.toFixed(2)}s</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Task Distribution</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(data.statusDistribution).map(([status, count], index) => {
                const colors = [
                  'from-emerald-50 to-green-50 text-emerald-600',
                  'from-blue-50 to-indigo-50 text-blue-600',
                  'from-orange-50 to-yellow-50 text-orange-600',
                  'from-purple-50 to-pink-50 text-purple-600',
                  'from-red-50 to-rose-50 text-red-600'
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={status} className={`flex justify-between items-center p-3 bg-gradient-to-r ${colorClass} rounded-lg`}>
                    <span className="font-medium">{status}</span>
                    <span className="font-bold text-lg">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Top Users</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(data.userActivity)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([user, count], index) => {
                  const colors = [
                    'from-yellow-50 to-amber-50 text-yellow-600',
                    'from-blue-50 to-cyan-50 text-blue-600',
                    'from-green-50 to-emerald-50 text-green-600',
                    'from-purple-50 to-violet-50 text-purple-600',
                    'from-pink-50 to-rose-50 text-pink-600'
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <div key={user} className={`flex justify-between items-center p-3 bg-gradient-to-r ${colorClass} rounded-lg`}>
                      <span className="font-medium">{user}</span>
                      <span className="font-bold text-lg">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Analytics Dashboard</h3>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{data.tasks.length}</div>
                <div className="text-xs text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {((data.statusDistribution['COMPLETED'] || 0) / data.tasks.length * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Object.keys(data.userActivity).length}</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200/50 text-center">
            <p className="text-sm text-gray-500">
              © 2025 Analytics Dashboard. Built with modern web technologies for optimal performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
