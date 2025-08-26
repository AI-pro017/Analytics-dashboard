'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface UserActivityChartProps {
  data: Record<string, number>;
  width?: number;
  height?: number;
}

export default function UserActivityChart({ data, width = 400, height = 300 }: UserActivityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!Object.keys(data).length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data
    const userData = Object.entries(data)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count);

    // Scales
    const xScale = d3.scaleBand()
      .domain(userData.map(d => d.username))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(userData, d => d.count) || 0])
      .range([innerHeight, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(userData.map(d => d.username))
      .range(d3.schemeCategory10);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#374151')
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#374151')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => d.toString()))
      .style('color', '#374151')
      .selectAll('text')
      .style('fill', '#374151')
      .style('font-size', '12px');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => ''))
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
      .text('Number of Tasks');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Users');

    // Add bars
    g.selectAll('.bar')
      .data(userData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.username) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.count))
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => colorScale(d.username) as string)
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        
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

        tooltip.html(`
          <div><strong>${d.username}</strong></div>
          <div>Tasks: ${d.count}</div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on top of bars
    g.selectAll('.value-label')
      .data(userData)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.username) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(d => d.count);

  }, [data, width, height]);

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">User Activity</h3>
            <p className="text-sm text-gray-600">Task distribution by user</p>
          </div>
        </div>
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>
    </div>
  );
}
