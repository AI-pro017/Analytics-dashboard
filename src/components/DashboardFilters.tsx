'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, Calendar, User, Clock, Download, RefreshCw, X } from 'lucide-react';

// Add debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: {
    start_date?: string;
    end_date?: string;
    username?: string;
    status?: string;
    min_execution_time?: number;
    max_execution_time?: number;
  }) => void;
  onExport: () => void;
  usernames: string[];
  statuses: string[];
  initialFilters?: {
    start_date?: string;
    end_date?: string;
    username?: string;
    status?: string;
    min_execution_time?: number;
    max_execution_time?: number;
  };
}

export default function DashboardFilters({
  onFiltersChange,
  onExport,
  usernames,
  statuses,
  initialFilters = {}
}: DashboardFiltersProps) {
  const [filters, setFilters] = useState({
    start_date: initialFilters.start_date || '',
    end_date: initialFilters.end_date || '',
    username: initialFilters.username || '',
    status: initialFilters.status || '',
    min_execution_time: initialFilters.min_execution_time?.toString() || '',
    max_execution_time: initialFilters.max_execution_time?.toString() || ''
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Update filters when initialFilters change
  useEffect(() => {
    const newFilters = {
      start_date: initialFilters.start_date || '',
      end_date: initialFilters.end_date || '',
      username: initialFilters.username || '',
      status: initialFilters.status || '',
      min_execution_time: initialFilters.min_execution_time?.toString() || '',
      max_execution_time: initialFilters.max_execution_time?.toString() || ''
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = async () => {
    setIsApplying(true);
    
    // Convert to proper types for API
    const apiFilters = {
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
      username: filters.username || undefined,
      status: filters.status || undefined,
      min_execution_time: filters.min_execution_time ? parseFloat(filters.min_execution_time) : undefined,
      max_execution_time: filters.max_execution_time ? parseFloat(filters.max_execution_time) : undefined
    };
    
    setAppliedFilters(filters);
    await onFiltersChange(apiFilters);
    setIsApplying(false);
  };

  const resetFilters = () => {
    const clearedFilters = {
      start_date: '',
      end_date: '',
      username: '',
      status: '',
      min_execution_time: '',
      max_execution_time: ''
    };
    setFilters(clearedFilters);
  };

  const clearAllFilters = async () => {
    setIsApplying(true);
    const clearedFilters = {
      start_date: '',
      end_date: '',
      username: '',
      status: '',
      min_execution_time: '',
      max_execution_time: ''
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    await onFiltersChange({});
    setIsApplying(false);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== '');
  const hasUnappliedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Dashboard Filters</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            {isExpanded ? 'Hide' : 'Show'} Advanced
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              disabled={isApplying}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2 inline" />
              Clear All
            </button>
          )}
          
          <button
            onClick={onExport}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Username
          </label>
          <select
            value={filters.username}
            onChange={(e) => handleFilterChange('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Users</option>
            {usernames.map(username => (
              <option key={username} value={username}>{username}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Execution Time Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Min Execution Time (s)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.min_execution_time}
                onChange={(e) => handleFilterChange('min_execution_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Max Execution Time (s)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.max_execution_time}
                onChange={(e) => handleFilterChange('max_execution_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="∞"
              />
            </div>
          </div>
        </div>
      )}

      {/* Apply/Reset Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges || isApplying}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
              hasUnappliedChanges && !isApplying
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isApplying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </>
            )}
          </button>

          <button
            onClick={resetFilters}
            disabled={isApplying}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        {hasUnappliedChanges && (
          <span className="text-sm text-amber-600 font-medium">
            You have unsaved filter changes
          </span>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (value === '') return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {key.replace('_', ' ')}: {value}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
