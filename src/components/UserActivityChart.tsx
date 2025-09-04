'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface UserActivityChartProps {
  data: Record<string, number>;
  width?: number;
  height?: number;
}

export default function UserActivityChart({ data, width = 900, height = 350 }: UserActivityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Object.keys(data).length || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Get actual container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const actualWidth = containerRect.width;
    const actualHeight = Math.min(400, Math.max(300, actualWidth * 0.4)); // Responsive height

    // Minimal margins to maximize chart area
    const margin = { top: 20, right: 20, bottom: 70, left: 50 };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = actualHeight - margin.top - margin.bottom;

    // Update SVG dimensions
    svg.attr('width', actualWidth).attr('height', actualHeight);

    // Prepare data
    const userData = Object.entries(data)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count);

    // Scales
    const xScale = d3.scaleBand()
      .domain(userData.map(d => d.username))
      .range([0, innerWidth])
      .padding(0.15);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(userData, d => d.count) || 0])
      .range([innerHeight, 0]);

    // Beautiful gradient colors
    const colors = [
      'url(#gradient1)', 'url(#gradient2)', 'url(#gradient3)', 
      'url(#gradient4)', 'url(#gradient5)', 'url(#gradient6)'
    ];

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define gradients
    const defs = svg.append('defs');
    const gradients = [
      { id: 'gradient1', colors: ['#3b82f6', '#1d4ed8'] },
      { id: 'gradient2', colors: ['#10b981', '#059669'] },
      { id: 'gradient3', colors: ['#8b5cf6', '#7c3aed'] },
      { id: 'gradient4', colors: ['#f59e0b', '#d97706'] },
      { id: 'gradient5', colors: ['#ef4444', '#dc2626'] },
      { id: 'gradient6', colors: ['#06b6d4', '#0891b2'] }
    ];

    gradients.forEach(grad => {
      const gradient = defs.append('linearGradient')
        .attr('id', grad.id)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', grad.colors[0])
        .attr('stop-opacity', 1);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', grad.colors[1])
        .attr('stop-opacity', 0.8);
    });

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => ''))
      .style('stroke', '#e5e7eb')
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.3);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#374151')
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600')
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
      .style('font-size', '12px')
      .style('font-weight', '600');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Tasks');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 5})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '13px')
      .style('font-weight', '600')
      .text('Team Members');

    // Add bars with animation
    const bars = g.selectAll('.bar')
      .data(userData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.username) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', (d, i) => colors[i % colors.length])
      .attr('rx', 6)
      .attr('ry', 6)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 8px 15px rgba(0, 0, 0, 0.2))')
          .attr('transform', 'scale(1.05)');
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '12px 16px')
          .style('border-radius', '8px')
          .style('font-size', '14px')
          .style('font-weight', '500')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('box-shadow', '0 10px 25px rgba(0, 0, 0, 0.2)');

        tooltip.html(`
          <div style="margin-bottom: 4px;"><strong>${d.username}</strong></div>
          <div>Tasks Completed: <span style="color: #60a5fa;">${d.count}</span></div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
          .attr('transform', 'scale(1)');
        d3.selectAll('.tooltip').remove();
      });

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.count))
      .attr('height', d => innerHeight - yScale(d.count));

    // Add value labels on top of bars with animation
    const labels = g.selectAll('.value-label')
      .data(userData)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.username) || 0) + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .style('opacity', 0)
      .text(d => d.count);

    labels.transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 500)
      .attr('y', d => yScale(d.count) - 8)
      .style('opacity', 1);

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const newRect = containerRef.current.getBoundingClientRect();
        const newWidth = newRect.width;
        const newHeight = Math.min(400, Math.max(300, newWidth * 0.4));
        
        if (Math.abs(newWidth - actualWidth) > 10) {
          // Redraw chart with new dimensions
          setTimeout(() => {
            if (svgRef.current && containerRef.current) {
              // Trigger re-render by updating a dummy state or calling the effect again
              const event = new Event('resize');
              window.dispatchEvent(event);
            }
          }, 100);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [data, width, height]);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      {/* Header with icon and title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-lg mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              User Activity Analysis
            </h3>
            <p className="text-sm text-gray-500 mt-1">Task distribution across team members</p>
          </div>
        </div>
        
      </div>
      
      {/* Chart container that fills available space */}
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>
    </div>
  );
}
