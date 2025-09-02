'use client';

import { TrendingUp, CheckCircle, Users } from 'lucide-react';

interface InsightCardsProps {
  executionTimeStats: {
    min: number;
    max: number;
    median: number;
  };
  statusDistribution: Record<string, number>;
  userActivity: Record<string, number>;
}

export default function InsightCards({ 
  executionTimeStats, 
  statusDistribution, 
  userActivity 
}: InsightCardsProps) {
  // Get top 3 users
  const topUsers = Object.entries(userActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Performance Insights */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-green-500 rounded-xl mr-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Performance Insights</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
            <span className="text-gray-700 font-medium">Fastest Task</span>
            <span className="text-green-600 font-bold">{executionTimeStats.min.toFixed(2)}s</span>
          </div>
          
          <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg">
            <span className="text-gray-700 font-medium">Slowest Task</span>
            <span className="text-orange-600 font-bold">{executionTimeStats.max.toFixed(2)}s</span>
          </div>
          
          <div className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
            <span className="text-gray-700 font-medium">Median Time</span>
            <span className="text-blue-600 font-bold">{executionTimeStats.median.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-purple-500 rounded-xl mr-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Task Distribution</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
            <span className="text-gray-700 font-medium">COMPLETED</span>
            <span className="text-green-600 font-bold text-xl">{statusDistribution['COMPLETED'] || 0}</span>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-500 rounded-xl mr-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Top Users</h3>
        </div>
        
        <div className="space-y-4">
          {topUsers.map(([username, count], index) => {
            const colors = ['text-yellow-600', 'text-blue-600', 'text-green-600'];
            return (
              <div key={username} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                <span className={`font-medium ${colors[index]}`}>{username}</span>
                <span className={`font-bold text-xl ${colors[index]}`}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
