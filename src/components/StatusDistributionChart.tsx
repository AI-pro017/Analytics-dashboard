'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface StatusDistributionChartProps {
  data: Record<string, number>;
  width?: number;
  height?: number;
}

export default function StatusDistributionChart({ data, width = 400, height = 400 }: StatusDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'percentage' | 'count'>('percentage');

  // Status configuration matching ExecutionTimeChart
  const statusConfig = {
    'COMPLETED': { color: '#10b981', icon: '✓' },
    'FAILED': { color: '#ef4444', icon: '✗' },
    'TIMEOUT': { color: '#f59e0b', icon: '⏱' },
    'CANCELLED': { color: '#6b7280', icon: '⊘' },
    'RUNNING': { color: '#8b5cf6', icon: '⟳' }
  };

  useEffect(() => {
    if (!Object.keys(data).length || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Get container dimensions
    const containerRect = containerRef.current.getBoundingClientRect();
    const actualWidth = containerRect.width;
    const actualHeight = height;

    const margin = { top: 15, right: 15, bottom: 15, left: 15 };
    const radius = Math.min(actualWidth - margin.left - margin.right - 30, actualHeight - margin.top - margin.bottom - 30) / 2;
    const centerX = actualWidth / 2;
    const centerY = actualHeight / 2;

    svg.attr('width', actualWidth).attr('height', actualHeight);

    // Prepare data for pie chart
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const pieData = Object.entries(data)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        percentage: (count / total) * 100,
        color: statusConfig[status as keyof typeof statusConfig]?.color || '#9ca3af'
      }))
      .sort((a, b) => b.count - a.count);

    if (pieData.length === 0) return;

    // Create pie generator - Full 360 degree circle
    const pie = d3.pie<typeof pieData[0]>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.01)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    // Create arc generators - Full circle (no donut hole)
    const arc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(0)
      .outerRadius(radius);

    const hoverArc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(0)
      .outerRadius(radius * 1.08);

    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Add gradient definitions
    const defs = svg.append('defs');
    pieData.forEach((item, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${i}`)
        .attr('cx', '30%')
        .attr('cy', '30%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(item.color)?.brighter(0.3)?.toString() || item.color);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', item.color);
    });

    // Create pie slices
    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter().append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => `url(#gradient-${i})`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d => hoverArc(d as any));
        
        setSelectedStatus(d.data.status);

        // Enhanced tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '12px 16px')
          .style('border-radius', '8px')
          .style('font-size', '14px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('box-shadow', '0 10px 25px rgba(0, 0, 0, 0.3)');

        const config = statusConfig[d.data.status as keyof typeof statusConfig];
        tooltip.html(`
          <div style="margin-bottom: 8px; font-weight: bold; color: ${d.data.color};">
            ${config?.icon || ''} ${d.data.status}
          </div>
          <div style="margin-bottom: 4px;">Count: <strong>${d.data.count}</strong></div>
          <div>Percentage: <strong>${d.data.percentage.toFixed(1)}%</strong></div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .style('opacity', 0)
        .transition()
        .duration(200)
        .style('opacity', 1);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d => arc(d as any));
        
        setSelectedStatus(null);
        d3.selectAll('.tooltip').remove();
      });

    // Add percentage labels on slices
    arcs.append('text')
      .attr('transform', d => {
        const centroid = arc.centroid(d);
        return `translate(${centroid})`;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
      .text(d => d.data.percentage > 8 ? `${d.data.percentage.toFixed(0)}%` : '');

    // Add center content (for full circle, we'll add it as overlay)
    const centerGroup = g.append('g').attr('class', 'center-content');
    
    // Add white circle background for center text
    centerGroup.append('circle')
      .attr('r', radius * 0.35)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
    
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#6b7280')
      .text('Total Tasks');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.8em')
      .style('font-size', '28px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(total);

    // Add animated entrance
    arcs.select('path')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('opacity', 1);

  }, [data, width, height, selectedStatus]);

  // Calculate statistics
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const completionRate = total > 0 ? ((data.COMPLETED || 0) / total * 100) : 0;
  const failureRate = total > 0 ? (((data.FAILED || 0) + (data.TIMEOUT || 0)) / total * 100) : 0;

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Task Status Distribution
          </h3>
          <p className="text-sm text-gray-500 mt-1">Completion status breakdown</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-1 bg-gray-50/80 rounded-2xl p-1.5 max-w-sm mx-auto">
          <button
            onClick={() => setViewMode('percentage')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              viewMode === 'percentage'
                ? 'bg-white shadow-lg text-gray-900 transform scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Percentage
          </button>
          <button
            onClick={() => setViewMode('count')}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              viewMode === 'count'
                ? 'bg-white shadow-lg text-gray-900 transform scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Count
          </button>
        </div>
      </div>

      {/* Chart Container - Full Circle */}
      <div ref={containerRef} className="flex items-center justify-center mb-12">
        <svg ref={svgRef} className="w-full h-95"></svg>
      </div>

      {/* Status Legend - Compact Layout */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(data)
          .filter(([_, count]) => count > 0)
          .sort(([,a], [,b]) => b - a)
          .map(([status, count]) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const percentage = total > 0 ? (count / total * 100) : 0;
            
            return (
              <div 
                key={status}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  selectedStatus === status 
                    ? 'bg-gray-100 shadow-md transform scale-[1.02]' 
                    : 'bg-gray-50/50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: config?.color || '#9ca3af' }}
                  ></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {config?.icon} {status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {viewMode === 'percentage' ? `${percentage.toFixed(1)}%` : count}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}