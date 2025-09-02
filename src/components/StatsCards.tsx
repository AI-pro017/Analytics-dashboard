'use client';

import { Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalTasks: number;
  executionTimeStats: {
    average: number;
    min: number;
    max: number;
    median: number;
  };
  statusDistribution: Record<string, number>;
  userActivity: Record<string, number>;
}

export default function StatsCards({ 
  totalTasks, 
  executionTimeStats, 
  statusDistribution, 
  userActivity 
}: StatsCardsProps) {
  const completedTasks = statusDistribution['COMPLETED'] || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const uniqueUsers = Object.keys(userActivity).length;
  const avgExecutionTime = executionTimeStats.average;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+5.2%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Users',
      value: uniqueUsers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+3',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Execution Time',
      value: `${avgExecutionTime.toFixed(2)}s`,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-0.3s',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const gradients = [
          'from-blue-500 to-cyan-500',
          'from-emerald-500 to-teal-500',
          'from-purple-500 to-pink-500',
          'from-orange-500 to-red-500'
        ];
        const bgGradients = [
          'from-blue-50 to-cyan-50',
          'from-emerald-50 to-teal-50',
          'from-purple-50 to-pink-50',
          'from-orange-50 to-red-50'
        ];

        
        return (
          <div key={index} className="group relative h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <div className="flex items-center justify-between flex-grow">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-4">
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      stat.changeType === 'positive' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <svg className={`w-3 h-3 mr-1 ${
                        stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                      }`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {stat.change}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className={`p-4 bg-gradient-to-r ${gradients[index]} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className={`mt-6 h-1 bg-gradient-to-r ${bgGradients[index]} rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r ${gradients[index]} rounded-full transition-all duration-1000 ease-out`} 
                     style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
