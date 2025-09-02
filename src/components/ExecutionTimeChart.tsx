'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { IndividualTask } from '@/lib/apiClient';
import apiClient from '@/lib/apiClient';

interface ExecutionTimeChartProps {
  data: unknown[];  // Fix: Replace any[] with unknown[]
  width?: number;
  height?: number;
}

export default function ExecutionTimeChart({ 
  width = 600,  // Fix: Add default width
  height = 400 
}: ExecutionTimeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tasks, setTasks] = useState<IndividualTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real individual task data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const individualTasks = await apiClient.getIndividualTasks();
        setTasks(individualTasks);
      } catch (error) {
        console.error('Error fetching individual tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (loading || tasks.length === 0 || !svgRef.current) return;

    // Get container width for responsiveness
    const container = svgRef.current.parentElement;
    const containerWidth = container ? container.clientWidth : width;
    const actualWidth = Math.max(600, containerWidth - 48); // Account for padding

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 120, bottom: 60, left: 80 };
    const chartWidth = actualWidth - margin.left - margin.right;  // Fix: Use actualWidth
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort tasks by index and get only COMPLETED tasks
    const completedTasks = tasks
      .filter(task => task.status === 'COMPLETED')
      .sort((a, b) => a.task_index - b.task_index)
      .map((task, index) => ({
        ...task,
        displayIndex: index // Use sequential index for display
      }));

    // Calculate average execution time
    const avgExecutionTime = completedTasks.reduce((sum, d) => sum + d.execution_time, 0) / completedTasks.length;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, completedTasks.length - 1])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(completedTasks, d => d.execution_time) || 0])
      .range([chartHeight, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat(() => "")
        .ticks(8)
      )
      .style("stroke", "#e5e7eb")
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);

    // Add axes with better tick spacing to avoid overlap
    const tickCount = Math.min(8, Math.floor(completedTasks.length / 10));
    const tickValues = [];
    for (let i = 0; i <= tickCount; i++) {
      tickValues.push(Math.floor((i * completedTasks.length) / tickCount));
    }

    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickValues(tickValues)
        .tickFormat(d => `Task ${Math.floor(Number(d))}`)  // Fix: Convert to number
      )
      .selectAll("text")
      .style("fill", "#374151")
      .style("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}s`)
        .ticks(8)
      )
      .selectAll("text")
      .style("fill", "#374151")
      .style("font-size", "11px");

    // Add average line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScale(avgExecutionTime))
      .attr("y2", yScale(avgExecutionTime))
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Add average line label
    g.append("text")
      .attr("x", chartWidth - 10)
      .attr("y", yScale(avgExecutionTime) - 5)
      .attr("text-anchor", "end")
      .style("fill", "#ef4444")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(`Avg: ${avgExecutionTime.toFixed(2)}s`);

    // Add scattered points for all completed tasks
    g.selectAll(".dot")
      .data(completedTasks)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.displayIndex))
      .attr("cy", d => yScale(d.execution_time))
      .attr("r", 3)
      .attr("fill", "#10b981")
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 5)
          .attr("opacity", 1);
          
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip.html(`
          <div><strong>Task ${d.displayIndex}</strong></div>
          <div>Execution Time: ${d.execution_time.toFixed(2)}s</div>
          <div>Status: ${d.status}</div>
          <div>User: ${d.username}</div>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 3)
          .attr("opacity", 0.8);
        d3.selectAll(".tooltip").remove();
      });

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${chartWidth + 20}, 20)`);

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#10b981");

    legend.append("text")
      .attr("x", 10)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#374151")
      .style("font-weight", "500")
      .text("COMPLETED");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#374151")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Execution Time (seconds)");

    g.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("fill", "#374151")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Task Index");

  }, [tasks, loading, height]); // Fix: Remove width from dependency

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading execution time data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 w-full">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Execution Time Trends</h3>
          <p className="text-sm text-gray-600">Task performance over time</p>
        </div>
      </div>
      
      <div className="w-full">  {/* Fix: Remove overflow-x-auto */}
        <svg
          ref={svgRef}
          width="100%"  
          height={height}
          className="w-full"
          viewBox={`0 0 600 ${height}`} 
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}
