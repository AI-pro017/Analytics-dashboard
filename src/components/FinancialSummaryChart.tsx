'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface FinancialData {
  rxSummary: Array<{year: string, channel: string, value: number}>;
  rebatesSummary: Array<{year: string, channel: string, value: number}>;
  wacSummary: Array<{year: string, channel: string, value: number}>;
  brandEstimates: Array<{year: string, channel: string, value: number}>;
}

interface FinancialSummaryChartProps {
  data: FinancialData;
  width?: number;
  height?: number;
}

type ChartType = 'rx' | 'rebates' | 'wac' | 'brand';

export default function FinancialSummaryChart({ data, width = 600, height = 400 }: FinancialSummaryChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedChart, setSelectedChart] = useState<ChartType>('rx');

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get current data based on selection
    let currentData: Array<{year: string, channel: string, value: number}> = [];
    
    switch (selectedChart) {
      case 'rx':
        currentData = data.rxSummary;
        break;
      case 'rebates':
        currentData = data.rebatesSummary;
        break;
      case 'wac':
        currentData = data.wacSummary;
        break;
      case 'brand':
        currentData = data.brandEstimates;
        break;
    }

    if (currentData.length === 0) return;

    // Group data by year and channel
    const groupedData = d3.group(currentData, d => d.year, d => d.channel);
    const years = Array.from(groupedData.keys()).sort();
    const channels = Array.from(new Set(currentData.map(d => d.channel))).sort();

    // Color scale for channels
    const colorScale = d3.scaleOrdinal()
      .domain(channels)
      .range(d3.schemeCategory10);

    // Scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, innerWidth])
      .padding(0.1);

    // Set appropriate Y-axis ranges based on chart type
    let yMax: number;
    switch (selectedChart) {
      case 'rx':
        yMax = 20000; // 20K for Rx data
        break;
      case 'rebates':
        yMax = 10000000; // 10M for Rebates data
        break;
      case 'wac':
        yMax = 50000000; // 50M for WAC data
        break;
      case 'brand':
        const maxBrandValue = d3.max(currentData, d => d.value) || 0;
        yMax = Math.ceil(maxBrandValue * 1.2); // Add 20% padding above max value
        break;
      default:
        yMax = d3.max(currentData, d => d.value) || 0;
    }

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style('color', '#374151')
      .selectAll('text')
      .style('fill', '#374151')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => {
          const value = d as number;
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
          return `$${value.toFixed(0)}`;
        })
        .ticks(selectedChart === 'rx' ? 5 : selectedChart === 'rebates' ? 6 : selectedChart === 'wac' ? 6 : 8)
      )
      .style('color', '#374151')
      .selectAll('text')
      .style('fill', '#374151')
      .style('font-size', '12px');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
        .ticks(selectedChart === 'rx' ? 5 : selectedChart === 'rebates' ? 6 : selectedChart === 'wac' ? 6 : 8)
      )
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
      .text('Value ($)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Year');

    // Create stacked bars
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

    // Add bars
    const barGroup = g.selectAll('.bar-group')
      .data(stackedData)
      .enter().append('g')
      .attr('class', 'bar-group')
      .attr('fill', (d: d3.Series<{[key: string]: number}, string>) => colorScale(d.key) as string);

    barGroup.selectAll('.bar')
      .data((d: d3.Series<{[key: string]: number}, string>) => d)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d: d3.SeriesPoint<{[key: string]: number}>, i: number) => xScale(years[i]) || 0)
      .attr('y', (d: d3.SeriesPoint<{[key: string]: number}>) => yScale(d[1]))
      .attr('height', (d: d3.SeriesPoint<{[key: string]: number}>) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d: d3.SeriesPoint<{[key: string]: number}>) {
        d3.select(this).attr('opacity', 1);
        
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

        const value = d[1] - d[0];
        const yearIndex = Math.floor((event.target as Element & {__data__: {index: number}}).__data__.index / channels.length);
        const year = years[yearIndex];
        const channel = (d as d3.SeriesPoint<{[key: string]: number}> & {key: string}).key;
        
        tooltip.html(`
          <div><strong>${year}</strong></div>
          <div>Channel: ${channel}</div>
          <div>Value: $${value.toLocaleString()}</div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        d3.selectAll('.tooltip').remove();
      });

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 20}, 20)`);

    channels.forEach((channel, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(channel) as string);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .style('font-size', '12px')
        .style('fill', '#374151')
        .style('font-weight', '500')
        .text(channel as string);
    });

  }, [data, selectedChart, width, height]);

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Financial Summary</h3>
              <p className="text-sm text-gray-600">Revenue and cost analysis</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'rx', label: 'Rx', color: 'from-blue-500 to-cyan-500' },
              { key: 'rebates', label: 'Rebates', color: 'from-emerald-500 to-teal-500' },
              { key: 'wac', label: 'WAC', color: 'from-purple-500 to-pink-500' },
              { key: 'brand', label: 'Brand', color: 'from-orange-500 to-red-500' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setSelectedChart(key as ChartType)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  selectedChart === key
                    ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                    : 'bg-white/50 text-gray-700 hover:bg-white/80 hover:shadow-md'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>
    </div>
  );
}
