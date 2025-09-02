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
  width = 800, 
  height = 400 
}: WeeklyUsageChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.week))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.task_count) || 0])
      .range([chartHeight, 0]);

    const yScale2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avg_execution_time) || 0])
      .range([chartHeight, 0]);

    // X-axis with proper colors
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("fill", "#374151") // Add this line
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y-axis for task count
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("fill", "#374151") // Add this line
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Task Count");

    // Y-axis for execution time (right side)
    g.append("g")
      .attr("transform", `translate(${chartWidth},0)`)
      .call(d3.axisRight(yScale2))
      .selectAll("text")
      .style("fill", "#374151") // Add this line
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Avg Execution Time (s)");

    // Task count bars
    g.selectAll(".task-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "task-bar")
      .attr("x", d => xScale(d.week) || 0)
      .attr("y", d => yScale(d.task_count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => chartHeight - yScale(d.task_count))
      .attr("fill", "steelblue")
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>Week: ${d.week}</strong><br/>
          Tasks: ${d.task_count}<br/>
          Avg Time: ${d.avg_execution_time.toFixed(2)}s<br/>
          Completion Rate: ${d.completion_rate.toFixed(1)}%<br/>
          Users: ${d.total_users}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Execution time line
    const line = d3.line<WeeklyUsage>()
      .x(d => (xScale(d.week) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale2(d.avg_execution_time));

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Execution time points
    g.selectAll(".execution-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "execution-point")
      .attr("cx", d => (xScale(d.week) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale2(d.avg_execution_time))
      .attr("r", 4)
      .attr("fill", "red")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

    // Chart title
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Weekly Usage Overview");

  }, [data, width, height]);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Weekly Usage Trends</h3>
      </div>
      
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        <span className="inline-block mr-4">
          <span className="inline-block w-3 h-3 bg-steelblue rounded mr-1"></span>
          Task Count
        </span>
        <span className="inline-block">
          <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>
          Avg Execution Time
        </span>
      </div>
    </div>
  );
}
