# Analytics Dashboard

A beautiful, interactive data visualization dashboard built with React, Next.js, and D3.js for analyzing task execution data and financial metrics.

## Features

### 📊 Interactive Visualizations
- **Execution Time Trends**: Scatter plot showing task execution times with status-based color coding
- **Task Status Distribution**: Donut chart displaying completion rates and status breakdown
- **User Activity**: Bar chart showing task distribution across users
- **Financial Summary**: Interactive stacked bar charts for Rx, Rebates, WAC, and Brand Estimates data

### 🎨 Modern UI/UX
- Clean, professional design with Tailwind CSS
- Responsive layout that works on all screen sizes
- Interactive tooltips and hover effects
- Loading states and error handling
- Real-time data processing from CSV files

### 📈 Key Metrics Dashboard
- Total tasks count
- Completion rate percentage
- Active users count
- Average execution time
- Performance insights (fastest/slowest tasks)
- Top users by activity

## Technology Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Visualization**: D3.js for custom charts
- **Styling**: Tailwind CSS
- **Data Processing**: Papa Parse for CSV parsing
- **Icons**: Lucide React

## Data Structure

The dashboard processes CSV data with the following key columns:
- `id`: Unique task identifier
- `service`: Task service type
- `status`: Task completion status
- `execution_time`: Task duration in seconds
- `username`: User who executed the task
- `progress`: Task completion percentage
- `result`: JSON data containing financial summaries

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Place your CSV data file in the `public` directory as `sample.csv`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

## Dashboard Components

### StatsCards
Displays key performance indicators with trend indicators and icons.

### ExecutionTimeChart
Interactive scatter plot showing execution time trends with:
- Color-coded points by task status
- Average execution time line
- Hover tooltips with detailed information
- Legend for status types

### StatusDistributionChart
Donut chart showing task status distribution with:
- Percentage labels for large segments
- Interactive hover effects
- Total task count in center
- Color-coded legend

### UserActivityChart
Bar chart displaying user activity with:
- Sorted by task count (highest first)
- Value labels on top of bars
- Hover tooltips
- Responsive design

### FinancialSummaryChart
Interactive financial data visualization with:
- Toggleable chart types (Rx, Rebates, WAC, Brand)
- Stacked bar charts by year and channel
- Formatted currency values
- Interactive legend and tooltips

## Data Processing

The dashboard automatically:
- Parses CSV data using Papa Parse
- Calculates execution time statistics (min, max, average, median)
- Aggregates status distribution
- Processes user activity metrics
- Extracts and formats financial data from JSON results
- Handles errors gracefully with user-friendly messages

## Customization

The dashboard is highly customizable:
- Chart colors can be modified in each component
- Chart dimensions are configurable via props
- Data processing logic can be extended in `dataProcessor.ts`
- Styling can be customized using Tailwind CSS classes

## Performance

- Efficient data processing with minimal re-renders
- Optimized D3.js visualizations
- Responsive design for all screen sizes
- Error boundaries and loading states

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design