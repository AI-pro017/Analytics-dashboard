const API_BASE_URL = 'https://de3f955f40ea.ngrok-free.app/api';

export interface DashboardOverview {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  avg_execution_time: number;
  min_execution_time: number;
  max_execution_time: number;
  unique_users: number;
  last_updated: string;
}

export interface WeeklyUsage {
  week: string;
  task_count: number;
  avg_execution_time: number;
  completion_rate: number;
  total_users: number;
}

export interface ExecutionTimeTrend {
  date: string;
  avg_time: number;
  task_count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface UserActivity {
  username: string;
  task_count: number;
  avg_execution_time: number;
  total_execution_time: number;
}

export interface FinancialData {
  rx_summary: Array<{year: string, channel: string, value: number}>;
  rebates_summary: Array<{year: string, channel: string, value: number}>;
  wac_summary: Array<{year: string, channel: string, value: number}>;
  brand_estimates: Array<{year: string, channel: string, value: number}>;
}

export interface FilteredData {
  data: Record<string, unknown>[];
  total_count: number;
  filters_applied: {
    start_date?: string;
    end_date?: string;
    username?: string;
    status?: string;
    min_execution_time?: number;
    max_execution_time?: number;
  };
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
  username?: string;
  status?: string;
  min_execution_time?: number;
  max_execution_time?: number;
}

export interface IndividualTask {
  task_index: number;
  execution_time: number;
  status: string;
  username: string;
  id: string;
}

class ApiClient {
  public baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard Overview
  async getDashboardOverview(filters?: DashboardFilters): Promise<DashboardOverview> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/dashboard/overview?${queryString}` : '/dashboard/overview';
    return this.request<DashboardOverview>(url);
  }

  // Weekly Usage
  async getWeeklyUsage(weeks: number = 12, filters?: DashboardFilters): Promise<WeeklyUsage[]> {
    const params = new URLSearchParams({ weeks: weeks.toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request<WeeklyUsage[]>(`/dashboard/weekly-usage?${params.toString()}`);
  }

  // Execution Time Trends
  async getExecutionTimeTrends(days: number = 30, filters?: DashboardFilters): Promise<ExecutionTimeTrend[]> {
    const params = new URLSearchParams({ days: days.toString() });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request<ExecutionTimeTrend[]>(`/dashboard/execution-time-trends?${params.toString()}`);
  }

  // Status Distribution
  async getStatusDistribution(filters?: DashboardFilters): Promise<StatusDistribution[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/dashboard/status-distribution?${queryString}` : '/dashboard/status-distribution';
    return this.request<StatusDistribution[]>(url);
  }

  // User Activity
  async getUserActivity(filters?: DashboardFilters): Promise<UserActivity[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/dashboard/user-activity?${queryString}` : '/dashboard/user-activity';
    return this.request<UserActivity[]>(url);
  }

  // Financial Summary
  async getFinancialData(filters?: DashboardFilters): Promise<FinancialData> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/dashboard/financial-summary?${queryString}` : '/dashboard/financial-summary';
    return this.request<FinancialData>(url);
  }

  // Filtered Data
  async getFilteredData(filters: DashboardFilters): Promise<FilteredData> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/dashboard/filtered-data${queryString ? `?${queryString}` : ''}`;
    
    return this.request<FilteredData>(endpoint);
  }

  // Health Check
  async healthCheck(): Promise<{status: string; timestamp: string}> {
    return this.request<{status: string; timestamp: string}>('/health');
  }

  // Add this public method
  async getFilterOptions(): Promise<{usernames: string[], statuses: string[]}> {
    return this.request<{usernames: string[], statuses: string[]}>('/dashboard/filter-options');
  }

  async getIndividualTasks(filters?: DashboardFilters): Promise<IndividualTask[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/dashboard/individual-tasks?${queryString}` : '/dashboard/individual-tasks';
    return this.request<IndividualTask[]>(url);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
