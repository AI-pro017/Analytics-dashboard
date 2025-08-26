'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TaskData } from '@/lib/dataProcessor';

interface ExecutionTimeChartProps {
  data: TaskData[];
  width?: number;
  height?: number;
}

export default function ExecutionTimeChart({ data, width = 400, height = 300 }: ExecutionTimeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter data with valid execution times
    const validData = data.filter(d => d.execution_time > 0);
    
    if (validData.length === 0) return;

    // Create time-based data points
    const timeData = validData.map((d, i) => ({
      index: i,
      time: d.execution_time,
      status: d.status,
      username: d.username,
      service: d.service
    }));

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, timeData.length - 1])
      .range([0, innerWidth]);

    const yExtent = d3.extent(timeData, d => d.time) as [number, number];
    const yMax = Math.ceil(yExtent[1] / 20) * 20; // Round up to nearest 20
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    // Color scale for status
    const colorScale = d3.scaleOrdinal()
      .domain(['COMPLETED', 'FAILED', 'RUNNING', 'PENDING'])
      .range(['#10b981', '#ef4444', '#f59e0b', '#6b7280']);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `Task ${d}`)
        .tickValues(d3.range(0, timeData.length, Math.max(1, Math.floor(timeData.length / 8)))))
      .style('color', '#374151')
      .selectAll('text')
      .style('fill', '#374151')
      .style('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}s`)
        .tickValues(d3.range(0, yMax + 1, Math.max(20, Math.ceil(yMax / 8)))))
      .style('color', '#374151')
      .selectAll('text')
      .style('fill', '#374151')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
        .tickValues(d3.range(0, timeData.length, Math.max(1, Math.floor(timeData.length / 8)))))
      .style('color', '#e5e7eb')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
        .tickValues(d3.range(0, yMax + 1, Math.max(20, Math.ceil(yMax / 8)))))
      .style('color', '#e5e7eb')
      .style('opacity', 0.3);

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Execution Time (seconds)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Task Index');

    // Add average line
    const average = d3.mean(timeData, d => d.time) || 0;
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(average))
      .attr('y2', yScale(average))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', yScale(average) - 5)
      .style('text-anchor', 'end')
      .style('fill', '#dc2626')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text(`Avg: ${average.toFixed(2)}s`);

    // Add data points
    g.selectAll('.dot')
      .data(timeData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.index))
      .attr('cy', d => yScale(d.time))
      .attr('r', 4)
      .attr('fill', (d: { index: number; time: number; status: string; username: string; service: string }) => colorScale(d.status) as string)
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6).attr('opacity', 1);
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000');

        const data = d as { index: number; time: number; status: string; username: string; service: string };
        tooltip.html(`
          <div><strong>Task ${data.index + 1}</strong></div>
          <div>Execution Time: ${data.time}s</div>
          <div>Status: ${data.status}</div>
          <div>User: ${data.username}</div>
          <div>Service: ${data.service}</div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 4).attr('opacity', 0.7);
        d3.selectAll('.tooltip').remove();
      });

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 80}, 20)`);

    const legendData = Array.from(new Set(timeData.map(d => d.status)));
    legendData.forEach((status, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('circle')
        .attr('r', 4)
        .attr('fill', colorScale(status) as string);

      legendItem.append('text')
        .attr('x', 10)
        .attr('y', 4)
        .style('font-size', '12px')
        .style('fill', '#374151')
        .style('font-weight', '500')
        .text(status);
    });

  }, [data, width, height]);

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Execution Time Trends</h3>
            <p className="text-sm text-gray-600">Task performance over time</p>
          </div>
        </div>
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>
    </div>
  );
}
