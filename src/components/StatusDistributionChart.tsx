'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface StatusDistributionChartProps {
  data: Record<string, number>;
  width?: number;
  height?: number;
}

export default function StatusDistributionChart({ data, width = 300, height = 300 }: StatusDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!Object.keys(data).length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 140, bottom: 20, left: 20 };
    const radius = Math.min(width, height) / 2 - margin.top;
    const centerX = width / 2;
    const centerY = height / 2;

    // Prepare data for pie chart
    const pieData = Object.entries(data).map(([status, count]) => ({
      status,
      count,
      percentage: (count / Object.values(data).reduce((sum, val) => sum + val, 0)) * 100
    }));

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(pieData.map(d => d.status))
      .range(['#10b981', '#ef4444', '#f59e0b', '#6b7280', '#8b5cf6', '#06b6d4']);

    // Create pie generator
    const pie = d3.pie<typeof pieData[0]>()
      .value(d => d.count)
      .sort(null);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    // Create label arc
    const labelArc = d3.arc<d3.PieArcDatum<typeof pieData[0]>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Create pie slices
    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.status) as string)
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
          <div><strong>${d.data.status}</strong></div>
          <div>Count: ${d.data.count}</div>
          <div>Percentage: ${d.data.percentage.toFixed(1)}%</div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        d3.selectAll('.tooltip').remove();
      });

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
      .text(d => d.data.percentage > 5 ? `${d.data.percentage.toFixed(0)}%` : '');

    // Add center text
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text('Total Tasks');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '28px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(total);

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 130}, 20)`);

    pieData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(item.status) as string);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .style('font-size', '12px')
        .style('fill', '#374151')
        .style('font-weight', '500')
        .text(`${item.status} (${item.count})`);
    });

  }, [data, width, height]);

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Task Status Distribution</h3>
            <p className="text-sm text-gray-600">Completion status breakdown</p>
          </div>
        </div>
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>
    </div>
  );
}
