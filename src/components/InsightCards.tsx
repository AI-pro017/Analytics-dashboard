'use client';

import { TrendingUp, CheckCircle, Users, Zap, Clock, Target, Award, Activity } from 'lucide-react';

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

  // Calculate additional metrics
  const totalTasks = Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);
  const completedTasks = statusDistribution['COMPLETED'] || 0;
  const failedTasks = statusDistribution['FAILED'] || 0;
  const runningTasks = statusDistribution['RUNNING'] || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Performance Insights */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-8">
            <div className="p-4 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Performance Insights
              </h3>
              <p className="text-sm text-gray-600 mt-1">Execution time analysis</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700 font-semibold">Fastest Task</span>
              </div>
              <span className="text-emerald-600 font-bold text-lg">{executionTimeStats.min.toFixed(2)}s</span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-gray-700 font-semibold">Slowest Task</span>
              </div>
              <span className="text-orange-600 font-bold text-lg">{executionTimeStats.max.toFixed(2)}s</span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700 font-semibold">Median Time</span>
              </div>
              <span className="text-blue-600 font-bold text-lg">{executionTimeStats.median.toFixed(2)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Distribution */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-blue-50/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Task Distribution
              </h3>
              <p className="text-sm text-gray-600 mt-1">Status breakdown</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700 font-semibold">COMPLETED</span>
              </div>
              <span className="text-emerald-600 font-bold text-2xl">{completedTasks}</span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-gray-700 font-semibold">FAILED</span>
              </div>
              <span className="text-red-600 font-bold text-2xl">{failedTasks}</span>
            </div>
            
            <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-600 rounded-full animate-pulse mr-3"></div>
                <span className="text-gray-700 font-semibold">Success Rate</span>
              </div>
              <span className="text-blue-600 font-bold text-2xl">{completionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-sky-50/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-cyan-600 to-sky-600 rounded-2xl mr-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Top Users
              </h3>
              <p className="text-sm text-gray-600 mt-1">Most active contributors</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {topUsers.map(([username, count], index) => {
              const gradients = [
                'from-yellow-50 to-amber-50 border-yellow-100/50',
                'from-blue-50 to-indigo-50 border-blue-100/50',
                'from-emerald-50 to-green-50 border-emerald-100/50'
              ];
              const textColors = [
                'text-yellow-600',
                'text-blue-600', 
                'text-emerald-600'
              ];
              const icons = [Award, Target, Activity];
              const IconComponent = icons[index];
              
              return (
                <div key={username} className={`flex justify-between items-center py-4 px-5 bg-gradient-to-r ${gradients[index]} rounded-2xl border hover:shadow-md transition-all duration-300`}>
                  <div className="flex items-center">
                    <IconComponent className={`h-5 w-5 ${textColors[index]} mr-3`} />
                    <span className={`font-semibold ${textColors[index]}`}>{username}</span>
                  </div>
                  <span className={`font-bold text-2xl ${textColors[index]}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
