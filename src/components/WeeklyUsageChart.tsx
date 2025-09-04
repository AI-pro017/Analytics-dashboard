'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WeeklyUsage } from '@/lib/apiClient';

interface WeeklyUsageChartProps {
  data: WeeklyUsage[];
  width?: number;
  height?: number;
}

export default function WeeklyUsageChart({ 
  data, 
  width = 1200, 
  height = 400 
}: WeeklyUsageChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get actual container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const actualWidth = containerRect.width;
    const actualHeight = height;

    // Enhanced margins for better layout
    const margin = { top: 30, right: 80, bottom: 60, left: 70 };
    const chartWidth = actualWidth - margin.left - margin.right;
    const chartHeight = actualHeight - margin.top - margin.bottom;

    // Update SVG dimensions
    svg.attr('width', actualWidth).attr('height', actualHeight);

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define gradients for beautiful styling
    const defs = svg.append('defs');
    
    // Gradient for bars
    const barGradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    barGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.9);
    
    barGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1d4ed8')
      .attr('stop-opacity', 0.7);

    // Gradient for line
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');
    
    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b');
    
    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#ef4444');

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.week))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.task_count) || 0])
      .range([chartHeight, 0]);

    const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avg_execution_time) || 0])
      .range([chartHeight, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat(() => ""))
      .style("stroke", "#e5e7eb")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .style("color", "#374151")
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Left Y-axis for task count
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "#374151")
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#3b82f6");

    // Right Y-axis for execution time
    g.append("g")
      .attr("transform", `translate(${chartWidth},0)`)
      .call(d3.axisRight(yScale2))
      .style("color", "#374151")
      .selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#f59e0b");

    // Y-axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#3b82f6")
      .text("Task Count");

    g.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", 0 - chartWidth - margin.right + 20)
      .attr("x", chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#f59e0b")
      .text("Avg Execution Time (s)");

    // Task count bars with animation
    const bars = g.selectAll(".task-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "task-bar")
      .attr("x", d => xScale(d.week) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("fill", "url(#barGradient)")
      .attr("rx", 6)
      .attr("ry", 6)
      .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("filter", "drop-shadow(0 8px 15px rgba(0, 0, 0, 0.2))")
          .attr("transform", "scale(1.02)");
        
        // Enhanced tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.9)")
          .style("color", "white")
          .style("padding", "16px 20px")
          .style("border-radius", "12px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .style("box-shadow", "0 20px 25px rgba(0, 0, 0, 0.3)")
          .style("backdrop-filter", "blur(10px)");

        tooltip.html(`
          <div style="margin-bottom: 8px; font-weight: bold; font-size: 16px;">${d.week}</div>
          <div style="margin-bottom: 4px;">📊 Tasks: <span style="color: #60a5fa;">${d.task_count}</span></div>
          <div style="margin-bottom: 4px;">⏱️ Avg Time: <span style="color: #fbbf24;">${d.avg_execution_time.toFixed(2)}s</span></div>
          <div style="margin-bottom: 4px;">✅ Success Rate: <span style="color: #34d399;">${d.completion_rate.toFixed(1)}%</span></div>
          <div>👥 Active Users: <span style="color: #a78bfa;">${d.total_users}</span></div>
        `)
        .style("left", (event.pageX + 15) + "px")
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
          .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")
          .attr("transform", "scale(1)");
        d3.selectAll('.tooltip').remove();
      });

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.task_count))
      .attr("height", d => chartHeight - yScale(d.task_count));

    // Execution time line with gradient
    const line = d3.line<WeeklyUsage>()
      .x(d => (xScale(d.week) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale2(d.avg_execution_time))
      .curve(d3.curveMonotoneX);

    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#lineGradient)")
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))")
      .attr("d", line);

    // Animate line
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Execution time points with animation
    const points = g.selectAll(".execution-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "execution-point")
      .attr("cx", d => (xScale(d.week) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale2(d.avg_execution_time))
      .attr("r", 0)
      .attr("fill", "#ffffff")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))");

    points.transition()
      .duration(500)
      .delay((d, i) => 2000 + i * 100)
      .attr("r", 6);

  }, [data, width, height]);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Weekly Usage Trends
            </h3>
            <p className="text-sm text-gray-500 mt-1">Task activity and performance over time</p>
          </div>
        </div>
        
        {/* Enhanced Legend */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-blue-50/80 rounded-xl px-4 py-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2 shadow-sm"></div>
            <span className="text-sm font-semibold text-blue-700">Task Count</span>
          </div>
          <div className="flex items-center bg-orange-50/80 rounded-xl px-4 py-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-2 shadow-sm"></div>
            <span className="text-sm font-semibold text-orange-700">Avg Time</span>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div ref={containerRef} className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>
    </div>
  );
}