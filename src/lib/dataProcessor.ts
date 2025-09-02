import apiClient, {
  DashboardOverview,
  WeeklyUsage,
  ExecutionTimeTrend,
  StatusDistribution,
  UserActivity,
  FinancialData
} from './apiClient';

export interface ProcessedData {
  overview: DashboardOverview;
  weeklyUsage: WeeklyUsage[];
  executionTimeTrends: ExecutionTimeTrend[];
  statusDistribution: StatusDistribution[];
  userActivity: UserActivity[];
  financialData: FinancialData;
}

export async function loadAndProcessData(): Promise<ProcessedData> {
  try {
    // Load all data in parallel
    const [
      overview,
      weeklyUsage,
      executionTimeTrends,
      statusDistribution,
      userActivity,
      financialData
    ] = await Promise.all([
      apiClient.getDashboardOverview(),
      apiClient.getWeeklyUsage(12),
      apiClient.getExecutionTimeTrends(30),
      apiClient.getStatusDistribution(),
      apiClient.getUserActivity(),
      apiClient.getFinancialData()
    ]);

    return {
      overview,
      weeklyUsage,
      executionTimeTrends,
      statusDistribution,
      userActivity,
      financialData
    };
  } catch (error) {
    console.error('Error loading data from API:', error);
    throw error;
  }
}

// Helper function to convert status distribution to the format expected by existing components
export function convertStatusDistribution(statusDistribution: StatusDistribution[]): Record<string, number> {
  const result: Record<string, number> = {};
  statusDistribution.forEach(item => {
    result[item.status] = item.count;
  });
  return result;
}

// Helper function to convert user activity to the format expected by existing components
export function convertUserActivity(userActivity: UserActivity[]): Record<string, number> {
  const result: Record<string, number> = {};
  userActivity.forEach(item => {
    result[item.username] = item.task_count;
  });
  return result;
}