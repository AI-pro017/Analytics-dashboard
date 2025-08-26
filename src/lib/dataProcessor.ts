import Papa from 'papaparse';

export interface TaskData {
  id: string;
  service: string;
  status: string;
  complete_message: string;
  logs: string;
  org_id: string;
  created_date: string;
  completed_date: string;
  progress: number;
  username: string;
  params: string;
  start_date: string;
  execution_time: number;
  metadata: string;
  result: string;
}

export interface ParsedResult {
  Rx_summary: Record<string, Record<string, number>>;
  Rebates_summary: Record<string, Record<string, number>>;
  Brand_WAC_Summary: Record<string, Record<string, number>>;
  Per_Brand_Estimates: Record<string, Record<string, number>>;
}

export interface ProcessedData {
  tasks: TaskData[];
  executionTimeStats: {
    average: number;
    min: number;
    max: number;
    median: number;
  };
  statusDistribution: Record<string, number>;
  userActivity: Record<string, number>;
  financialData: {
    rxSummary: Array<{year: string, channel: string, value: number}>;
    rebatesSummary: Array<{year: string, channel: string, value: number}>;
    wacSummary: Array<{year: string, channel: string, value: number}>;
    brandEstimates: Array<{year: string, channel: string, value: number}>;
  };
}

export async function loadAndProcessData(): Promise<ProcessedData> {
  try {
    const response = await fetch('/sample.csv');
    const csvText = await response.text();
    
    const parseResult = Papa.parse<TaskData>(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        if (field === 'progress') return parseInt(value) || 0;
        if (field === 'execution_time') return parseFloat(value) || 0;
        return value;
      }
    });

    const tasks = parseResult.data;
    
    // Calculate execution time statistics
    const executionTimes = tasks.map(task => task.execution_time).filter(time => time > 0);
    const sortedTimes = executionTimes.sort((a, b) => a - b);
    const average = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const min = Math.min(...executionTimes);
    const max = Math.max(...executionTimes);
    const median = sortedTimes[Math.floor(sortedTimes.length / 2)];

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    tasks.forEach(task => {
      statusDistribution[task.status] = (statusDistribution[task.status] || 0) + 1;
    });

    // User activity
    const userActivity: Record<string, number> = {};
    tasks.forEach(task => {
      userActivity[task.username] = (userActivity[task.username] || 0) + 1;
    });

    // Parse financial data from result column
    const financialData = parseFinancialData(tasks);

    return {
      tasks,
      executionTimeStats: { average, min, max, median },
      statusDistribution,
      userActivity,
      financialData
    };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

function parseFinancialData(tasks: TaskData[]) {
  const rxSummary: Array<{year: string, channel: string, value: number}> = [];
  const rebatesSummary: Array<{year: string, channel: string, value: number}> = [];
  const wacSummary: Array<{year: string, channel: string, value: number}> = [];
  const brandEstimates: Array<{year: string, channel: string, value: number}> = [];

  tasks.forEach(task => {
    try {
      const result = JSON.parse(task.result);

      
      // Parse Rx Summary
      if (result.Rx_summary) {

        const rxData = JSON.parse(result.Rx_summary) as Record<string, Record<string, number>>;
        Object.entries(rxData).forEach(([year, channels]) => {
          Object.entries(channels).forEach(([channel, value]) => {
            rxSummary.push({ year, channel, value: Number(value) });
          });
        });

      }

      // Parse Rebates Summary
      if (result.Rebates_summary) {

        const rebatesData = JSON.parse(result.Rebates_summary) as Record<string, Record<string, number>>;
        Object.entries(rebatesData).forEach(([year, channels]) => {
          Object.entries(channels).forEach(([channel, value]) => {
            rebatesSummary.push({ year, channel, value: Number(value) });
          });
        });

      }

      // Parse WAC Summary
      if (result.Brand_WAC_Summary) {

        const wacData = JSON.parse(result.Brand_WAC_Summary) as Record<string, Record<string, number>>;
        Object.entries(wacData).forEach(([year, channels]) => {
          Object.entries(channels).forEach(([channel, value]) => {
            // Convert WAC1, WAC2, etc. to Year1, Year2, etc.
            const normalizedYear = year.replace('WAC', 'Year');
            wacSummary.push({ year: normalizedYear, channel, value: Number(value) });
          });
        });

      }

      // Parse Brand Estimates
      if (result['Per Brand Estimates']) {

        const brandData = JSON.parse(result['Per Brand Estimates']) as Record<string, Record<string, number>>;
        Object.entries(brandData).forEach(([year, channels]) => {
          Object.entries(channels).forEach(([channel, value]) => {
            brandEstimates.push({ year, channel, value: Number(value) });
          });
        });

      }
    } catch (error) {
      console.warn('Error parsing result data for task:', task.id, error);
    }
  });



  return {
    rxSummary,
    rebatesSummary,
    wacSummary,
    brandEstimates
  };
}
