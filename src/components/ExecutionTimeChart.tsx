'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ExecutionTimeTrend {
  date: string;
  completed_avg_time: number;
  failed_avg_time: number;
  timeout_avg_time: number;
  cancelled_avg_time: number;
  completed_count: number;
  failed_count: number;
  timeout_count: number;
  cancelled_count: number;
  running_count: number;
  total_count: number;
}

interface ProcessedTrend extends Omit<ExecutionTimeTrend, 'date'> {
  date: Date;
}

interface ExecutionTimeChartProps {
  data: ExecutionTimeTrend[];
  width?: number;
  height?: number;
}

export default function ExecutionTimeChart({ 
  data,
  width = 600,
  height = 400 
}: ExecutionTimeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('COMPLETED');

  // Status configuration
  const statusConfig = {
    'COMPLETED': { color: '#10b981', key: 'completed_avg_time', countKey: 'completed_count', label: 'Completed Tasks' },
    'FAILED': { color: '#ef4444', key: 'failed_avg_time', countKey: 'failed_count', label: 'Failed Tasks' },
    'TIMEOUT': { color: '#f59e0b', key: 'timeout_avg_time', countKey: 'timeout_count', label: 'Timeout Tasks' },
    'CANCELLED': { color: '#6b7280', key: 'cancelled_avg_time', countKey: 'cancelled_count', label: 'Cancelled Tasks' }
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const actualWidth = containerRect.width;
    const actualHeight = height;

    // Margins
    const margin = { top: 40, right: 60, bottom: 80, left: 80 };
    const chartWidth = actualWidth - margin.left - margin.right;
    const chartHeight = actualHeight - margin.top - margin.bottom;

    svg.attr('width', actualWidth).attr('height', actualHeight);

    // Parse and process data
    const parseDate = d3.timeParse("%Y-%m-%d");
    const processedData: ProcessedTrend[] = data
      .map(d => ({ ...d, date: parseDate(d.date) }))
      .filter((d): d is ProcessedTrend => d.date !== null);

    if (processedData.length === 0) return;

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get current status config
    const currentConfig = statusConfig[selectedStatus as keyof typeof statusConfig];
    const { color, key, countKey } = currentConfig;

    // Filter data for selected status
    const relevantData = processedData.filter(d => (d as any)[countKey] > 0);
    
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const maxTime = d3.max(relevantData, d => (d as any)[key]) || 100;
    const yScale = d3.scaleLinear()
      .domain([0, maxTime * 1.1])
      .range([chartHeight, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat(() => ""))
      .style("stroke", "#f1f5f9")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.7);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat((domainValue) => d3.timeFormat("%m/%d")(domainValue as Date)))
      .style("color", "#64748b")
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#64748b");

    g.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(6)
        .tickFormat(d => `${d}s`))
      .style("color", "#64748b")
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#64748b");

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 25)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Average Execution Time (seconds)");

    if (relevantData.length > 0) {
      // Create area generator for filled area under line
      const area = d3.area<ProcessedTrend>()
        .x(d => xScale(d.date))
        .y0(chartHeight)
        .y1(d => yScale((d as any)[key]))
        .curve(d3.curveMonotoneX);

      // Create line generator
      const line = d3.line<ProcessedTrend>()
        .x(d => xScale(d.date))
        .y(d => yScale((d as any)[key]))
        .curve(d3.curveMonotoneX);

      // Add gradient for area fill
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "areaGradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", yScale(0))
        .attr("x2", 0).attr("y2", yScale(maxTime));

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.1);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.3);

      // Add area
      g.append("path")
        .datum(relevantData)
        .attr("fill", "url(#areaGradient)")
        .attr("d", area);

      // Add line
      const path = g.append("path")
        .datum(relevantData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .style("filter", "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))");

      // Animate line
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      // Add data points
      g.selectAll(".data-point")
        .data(relevantData)
        .enter().append("circle")
        .attr("class", "data-point")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale((d as any)[key]))
        .attr("r", 0)
        .attr("fill", "#ffffff")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8);

          // Create tooltip
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px 16px")
            .style("border-radius", "8px")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.3)");

          tooltip.html(`
            <div style="margin-bottom: 8px; font-weight: bold; color: ${color};">
              ${selectedStatus} TASKS
            </div>
            <div style="margin-bottom: 4px;">
              📅 ${d.date.toLocaleDateString()}
            </div>
            <div style="margin-bottom: 4px;">
              ⏱️ Avg Time: ${((d as any)[key] as number).toFixed(2)}s
            </div>
            <div style="margin-bottom: 4px;">
              📊 Count: ${(d as any)[countKey]}
            </div>
            <div>
              📈 Total Tasks: ${d.total_count}
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("opacity", 0)
          .transition()
          .duration(200)
          .style("opacity", 1);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5);
          d3.selectAll('.tooltip').remove();
        });

      // Animate points
      g.selectAll(".data-point")
        .transition()
        .duration(500)
        .delay((d, i) => 2000 + i * 100)
        .attr("r", 5);
    } else {
      // No data message
      g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#9ca3af")
        .text(`No ${selectedStatus.toLowerCase()} tasks found`);
    }

    // Add running tasks indicator at bottom
    const runningData = processedData.filter(d => d.running_count > 0);
    if (runningData.length > 0) {
      g.selectAll(".running-indicator")
        .data(runningData)
        .enter().append("rect")
        .attr("class", "running-indicator")
        .attr("x", d => xScale(d.date) - 2)
        .attr("y", chartHeight - 8)
        .attr("width", 4)
        .attr("height", 8)
        .attr("fill", "#8b5cf6")
        .attr("opacity", 0.8)
        .attr("rx", 2)
        .on("mouseover", function(event, d) {
          const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(139, 92, 246, 0.9)")
            .style("color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

          tooltip.html(`
            <div><strong>${d.date.toLocaleDateString()}</strong></div>
            <div>🏃 RUNNING: ${d.running_count} tasks</div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => d3.selectAll('.tooltip').remove());
    }

  }, [data, selectedStatus, width, height]);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Execution Time Trends
          </h3>
          <p className="text-sm text-gray-500 mt-1">Task performance analysis by status</p>
        </div>
      </div>

      {/* Status Selector - Full Width */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-1 bg-gray-50/80 rounded-2xl p-1.5 max-w-2xl mx-auto">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                selectedStatus === status
                  ? 'bg-white shadow-lg text-gray-900 transform scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: config.color }}
                ></div>
                <span>{status}</span>
              </div>
              {selectedStatus === status && (
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full"
                  style={{ backgroundColor: config.color }}
                ></div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart Container */}
      <div ref={containerRef} className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>

      {/* Status Summary Cards */}
      <div className="mt-8">
        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {Object.entries(statusConfig).map(([status, config]) => {
            const totalCount = data.reduce((sum, d) => sum + (d as any)[config.countKey], 0);
            const avgTime = data.length > 0 
              ? data.reduce((sum, d) => sum + (d as any)[config.key], 0) / data.filter(d => (d as any)[config.countKey] > 0).length || 0
              : 0;

            return (
              <div 
                key={status}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-center ${
                  selectedStatus === status 
                    ? 'bg-white border-gray-200 shadow-lg transform scale-[1.02] ring-2 ring-opacity-20' 
                    : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                }`}
                style={{
                  '--tw-ring-color': selectedStatus === status ? config.color : 'transparent'
                } as React.CSSProperties}
                onClick={() => setSelectedStatus(status)}
              >
                <div className="flex items-center justify-center mb-3">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: config.color }}
                  ></div>
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {status}
                  </span>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {totalCount}
                </div>
                
                <div className="text-sm text-gray-500">
                  Avg: <span className="font-semibold">{avgTime.toFixed(2)}s</span>
                </div>
                
                {selectedStatus === status && (
                  <div className="mt-3 text-xs text-gray-400 font-medium">
                    Currently Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}