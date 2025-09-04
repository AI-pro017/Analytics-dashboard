'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


interface FinancialSummaryChartProps {
  data: {
    rx_summary: Array<{year: string, channel: string, value: number}>;
    rebates_summary: Array<{year: string, channel: string, value: number}>;
    wac_summary: Array<{year: string, channel: string, value: number}>;
    brand_estimates: Array<{year: string, channel: string, value: number}>;
  };
  width?: number;
  height?: number;
}

type ChartType = 'rx' | 'rebates' | 'wac' | 'brand';

export default function FinancialSummaryChart({ data, width = 800, height = 600 }: FinancialSummaryChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartType>('rx');

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 100, bottom: 30, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get current data based on selection
    let currentData: Array<{year: string, channel: string, value: number}> = [];
    
    switch (selectedChart) {
      case 'rx':
        currentData = data.rx_summary;
        break;
      case 'rebates':
        currentData = data.rebates_summary;
        break;
      case 'wac':
        currentData = data.wac_summary;
        break;
      case 'brand':
        currentData = data.brand_estimates;
        break;
    }

    if (currentData.length === 0) return;

    // Group data by year and channel
    const groupedData = d3.group(currentData, d => d.year, d => d.channel);
    const years = Array.from(groupedData.keys()).sort();
    const channels = Array.from(new Set(currentData.map(d => d.channel))).sort();

    // Enhanced color palette with gradients
    const colorPalette = {
      rx: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
      rebates: ['#10B981', '#059669', '#047857', '#065F46'],
      wac: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
      brand: ['#F59E0B', '#D97706', '#B45309', '#92400E']
    };

    const colorScale = d3.scaleOrdinal()
      .domain(channels)
      .range(colorPalette[selectedChart]);

    // Scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.2);

    // Dynamic Y-axis scaling based on data with better padding
    const maxValue = d3.max(currentData, d => d.value) || 0;
    
        // Dynamic Y-axis scaling based on chart type and data size
    let yMax = Math.ceil(maxValue * 1.5); // Base 50% padding for Rx Revenue
    
    // Specific scaling for each chart type that was exceeding Y-axis
    switch (selectedChart) {
      case 'rx':
        yMax = Math.ceil(maxValue * 1.5); // 50% padding - works well
        break;
      case 'rebates':
        yMax = Math.ceil(maxValue * 1.8); // 80% padding - more space needed
        break;
      case 'wac':
        yMax = Math.ceil(maxValue * 2.2); // 120% padding - much more space needed
        break;
      case 'brand':
        yMax = Math.ceil(maxValue * 2.0); // 100% padding - most space needed
        break;
    }
    
    // For extremely large values, add additional padding
    if (maxValue > 1000000000) { // If over 1B
      yMax = Math.ceil(yMax * 1.1); // Add extra 10% padding
    } else if (maxValue > 100000000) { // If over 100M
      yMax = Math.ceil(yMax * 1.05); // Add extra 5% padding
    }
    
    // Ensure minimum range for small values
    if (yMax < 100) yMax = 100;
    
    // Debug: Log the Y-axis scaling
    console.log(`${selectedChart} chart - Max value: ${maxValue}, Y-axis max: ${yMax}`);
    
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add gradient definitions
    const defs = svg.append('defs');
    channels.forEach((channel) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${channel}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(channel) as string)
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(channel) as string)
        .attr('stop-opacity', 0.4);
    });

    // Add axes with enhanced styling
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#6B7280')
      .selectAll('text')
      .style('fill', '#6B7280')
      .style('font-size', '12px')
      .style('font-weight', '500');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          const value = d as number;
          if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
          return `$${value.toLocaleString()}`;
        })
        .ticks(8) // Increase number of ticks for better readability
      )
      .style('color', '#6B7280')
      .selectAll('text')
      .style('fill', '#6B7280')
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Add subtle grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
        .ticks(8) // Match the main axis tick count
      )
      .style('color', '#E5E7EB')
      .style('opacity', 0.3)
      .style('stroke-dasharray', '2,2');

    // Add axis labels with enhanced styling
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Value ($)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom+10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Year');

    // Create stacked bars with enhanced styling
    const stack = d3.stack<{[key: string]: number}, string>()
      .keys(channels);

    const stackedData = stack(
      years.map(year => {
        const obj: {[key: string]: number} = {};
        channels.forEach(channel => {
          const yearData = groupedData.get(year);
          const channelData = yearData?.get(channel);
          obj[channel] = channelData ? channelData[0].value : 0;
        });
        return obj;
      })
    );

    // Add bars with enhanced styling and animations
    const barGroup = g.selectAll('.bar-group')
      .data(stackedData)
      .enter().append('g')
      .attr('class', 'bar-group')
      .attr('fill', (d: d3.Series<{[key: string]: number}, string>) => `url(#gradient-${d.key})`);

    barGroup.selectAll('.bar')
      .data((d: d3.Series<{[key: string]: number}, string>) => d)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d: d3.SeriesPoint<{[key: string]: number}>, i: number) => xScale(years[i]) || 0)
      .attr('y', (d: d3.SeriesPoint<{[key: string]: number}>) => yScale(d[1]))
      .attr('height', (d: d3.SeriesPoint<{[key: string]: number}>) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4)
      .attr('opacity', 0)
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
      .on('mouseover', function(event, d: d3.SeriesPoint<{[key: string]: number}>) {
        d3.select(this)
          .attr('opacity', 1)
          .style('filter', 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2))')
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.02)');
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(17, 24, 39, 0.95)')
          .style('color', 'white')
          .style('padding', '12px 16px')
          .style('border-radius', '8px')
          .style('font-size', '13px')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('backdrop-filter', 'blur(8px)')
          .style('border', '1px solid rgba(255, 255, 255, 0.1)')
          .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');

        const parentGroup = d3.select(this.parentNode as SVGGElement);
        const channel = parentGroup.datum() as d3.Series<{[key: string]: number}, string>;
        const channelName = channel.key;
        
        const bars = d3.select(this.parentNode as SVGGElement).selectAll('.bar');
        const barIndex = bars.nodes().indexOf(this);
        const year = years[barIndex];
        
        const value = d[1] - d[0];
        
        tooltip.html(`
          <div style="font-weight: 600; margin-bottom: 4px; color: #FBBF24;">${year}</div>
          <div style="margin-bottom: 2px;">Channel: <span style="color: #A7F3D0;">${channelName}</span></div>
          <div style="font-weight: 600; color: #60A5FA;">$${value.toLocaleString()}</div>
        `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.9)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');
        d3.selectAll('.tooltip').remove();
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('opacity', 0.9);

    // Enhanced legend with better styling
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 20}, 20)`);

    channels.forEach((channel, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 28})`)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this).select('rect').attr('opacity', 0.8);
          d3.select(this).select('text').style('font-weight', '600');
        })
        .on('mouseout', function() {
          d3.select(this).select('rect').attr('opacity', 1);
          d3.select(this).select('text').style('font-weight', '500');
        });

      legendItem.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', colorScale(channel) as string)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

      legendItem.append('text')
        .attr('x', 24)
        .attr('y', 12)
        .style('font-size', '13px')
        .style('fill', '#374151')
        .style('font-weight', '500')
        .text(channel as string);
    });

    // Add value labels on bars for better readability
    barGroup.selectAll('.value-label')
      .data((d: d3.Series<{[key: string]: number}, string>) => d)
      .enter().append('text')
      .attr('class', 'value-label')
      .attr('x', (d: d3.SeriesPoint<{[key: string]: number}>, i: number) => (xScale(years[i]) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d: d3.SeriesPoint<{[key: string]: number}>) => yScale((d[0] + d[1]) / 2))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text((d: d3.SeriesPoint<{[key: string]: number}>) => {
        const value = d[1] - d[0];
        if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toLocaleString()}`;
      });

  }, [data, selectedChart, width, height]);

  return (
    <div className="group relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
      
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl mr-5 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Financial Summary
              </h3>
              <p className="text-gray-600 mt-1">Comprehensive revenue and cost analysis</p>
            </div>
          </div>
          
          {/* Enhanced Chart Type Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'rx', label: 'Rx Revenue', color: 'from-blue-500 to-cyan-500', icon: '💊' },
              { key: 'rebates', label: 'Rebates', color: 'from-emerald-500 to-teal-500', icon: '💰' },
              { key: 'wac', label: 'WAC Pricing', color: 'from-purple-500 to-pink-500', icon: '📊' },
              { key: 'brand', label: 'Brand Est.', color: 'from-orange-500 to-red-500', icon: '🏷️' }
            ].map(({ key, label, color, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as ChartType)}
                className={`px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  selectedChart === key
                    ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105 ring-2 ring-white/20`
                    : 'bg-gray-50/80 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105 border border-gray-200/50'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="relative">
          <svg ref={svgRef} width={width} height={height} className="w-full h-auto"></svg>
          
          {/* Chart overlay info */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-white/50">
            <div className="text-xs text-gray-600 font-medium">
              {selectedChart === 'rx' && 'Rx Revenue Analysis'}
              {selectedChart === 'rebates' && 'Rebates Summary'}
              {selectedChart === 'wac' && 'WAC Pricing Data'}
              {selectedChart === 'brand' && 'Brand Estimates'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
