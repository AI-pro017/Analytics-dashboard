# Analytics Dashboard - React + FastAPI

A comprehensive data visualization dashboard built with React (Next.js) frontend and FastAPI backend, featuring D3.js charts for beautiful data visualization.

## 🚀 Features

### Dashboard Metrics
- **Weekly Usage Report** - Activity breakdown by week with trend analysis
- **Total Usage** - Overall statistics across the entire dataset
- **Run Time Trends** - Time series analysis of task execution times
- **Progress & Completion** - Task status distribution and completion rates

### Advanced Features
- **Filters** - Date range, username, status, and execution time filtering
- **Export** - CSV download functionality for filtered data
- **Drilldown** - Interactive charts with detailed tooltips
- **Responsive Design** - Optimized for desktop and mobile devices

### Technical Features
- **Modular Architecture** - Easy integration into existing React/FastAPI projects
- **Real-time Data** - FastAPI backend serves live data from CSV
- **Beautiful UI** - Modern design with glassmorphism effects
- **Type Safety** - Full TypeScript implementation

## 🏗️ Project Structure
Dashboard_React_Fastapi/
├── backend/
│ ├── main.py # FastAPI application
│ ├── start.py # Development server
│ ├── requirements.txt # Python dependencies
│ └── sample.csv # Data source
└── frontend/
├── src/
│ ├── app/
│ │ └── page.tsx # Main dashboard page
│ ├── components/ # React components
│ │ ├── DashboardFilters.tsx
│ │ ├── WeeklyUsageChart.tsx
│ │ ├── ExecutionTimeChart.tsx
│ │ ├── StatusDistributionChart.tsx
│ │ ├── UserActivityChart.tsx
│ │ ├── FinancialSummaryChart.tsx
│ │ └── StatsCards.tsx
│ └── lib/
│ ├── apiClient.ts # API communication
│ └── dataProcessor.ts # Data processing
├── package.json
└── ...


## 🔧 Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server**
   ```bash
   python start.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The dashboard will be available at `http://localhost:3000`

## 📊 API Endpoints

### Core Dashboard Data
- `GET /api/dashboard/overview` - Overview statistics
- `GET /api/dashboard/weekly-usage` - Weekly usage breakdown
- `GET /api/dashboard/execution-time-trends` - Time series data
- `GET /api/dashboard/status-distribution` - Task status distribution
- `GET /api/dashboard/user-activity` - User activity summary
- `GET /api/dashboard/financial-summary` - Financial data from CSV

### Filtering & Export
- `GET /api/dashboard/filtered-data` - Apply filters to data
- `GET /api/export/csv` - Export filtered data as CSV
- `GET /api/dashboard/filter-options` - Available filter options

### Utility
- `GET /api/health` - Health check
- `GET /` - API status

## 🎨 Component Architecture

### Modular Components
- **DashboardFilters** - Advanced filtering with date ranges, users, status
- **WeeklyUsageChart** - Dual-axis chart showing task count and execution time
- **ExecutionTimeChart** - Line chart for time series analysis
- **StatusDistributionChart** - Pie chart for task status breakdown
- **UserActivityChart** - Bar chart for user activity comparison
- **FinancialSummaryChart** - Multi-series chart for financial data

### Data Flow
1. **API Client** - Handles all HTTP requests to FastAPI backend
2. **Data Processor** - Transforms API responses for component consumption
3. **Components** - Render D3.js visualizations with processed data

## 🔄 Integration Guide

This dashboard is designed for easy integration into existing React/FastAPI projects:

### Backend Integration
```python
# Import the main app
from main import app

# Mount as sub-application
main_app.mount("/dashboard", app)
```

### Frontend Integration
```typescript
// Import components
import { WeeklyUsageChart, DashboardFilters } from './components';

// Use in your existing React app
<WeeklyUsageChart data={weeklyData} />
```

## 🛠️ Development

### Adding New Charts
1. Create component in `frontend/src/components/`
2. Add data interface in `apiClient.ts`
3. Create API endpoint in `backend/main.py`
4. Import and use in main dashboard

### Customizing Data Source
- Replace `sample.csv` with your data file
- Update data processing logic in `load_and_process_csv()`
- Modify API endpoints to match your data structure

## 📈 Performance Features

- **Parallel API Calls** - All dashboard data loads simultaneously
- **Efficient D3.js Rendering** - Optimized chart updates and transitions
- **Responsive Design** - Adaptive layouts for all screen sizes
- **Error Handling** - Comprehensive error states and recovery
- **Type Safety** - Full TypeScript coverage prevents runtime errors

## 🔐 Security & CORS

The backend includes CORS middleware configured for local development. For production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📝 License

This project is built for demonstration purposes. Feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ using React, FastAPI, D3.js, and TypeScript**