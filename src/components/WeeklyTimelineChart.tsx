import React from 'react';
import { ResponsiveLine } from '@nivo/line';

import type { WeekData } from '../types';

interface WeeklyTimelineChartProps {
  weeklyData: WeekData[];
  selectedTimePeriod: string;
}

const WeeklyTimelineChart: React.FC<WeeklyTimelineChartProps> = ({ 
  weeklyData, 
  selectedTimePeriod 
}) => {
  const formatWeekLabel = (weekStart: Date): string => {
    const years = new Set(weeklyData.map(week => week.weekStart.getFullYear()));
    const hasMultipleYears = years.size > 1;
    
    if (hasMultipleYears) {
      return weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
    } else {
      return weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const sortedWeeklyData = weeklyData.slice().reverse();
  
  const chartData = [
    {
      id: 'weekly-mileage',
      data: sortedWeeklyData.map((week) => ({
        x: formatWeekLabel(week.weekStart),
        y: week.totalMiles,
        week: week
      }))
    }
  ];

  const totalWeeks = sortedWeeklyData.length;
  const interval = Math.max(1, Math.floor(totalWeeks / 8));
  const tickValues = sortedWeeklyData
    .filter((_, index) => index % interval === 0 || index === totalWeeks - 1)
    .map(week => formatWeekLabel(week.weekStart));

  return (
    <div className="weekly-timeline-graph">
      <h3>Weekly Mileage Over Time</h3>
      <div className="timeline-graph-container">
        <div className="timeline-chart">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 60, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 0,
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            yFormat=" >-.1f"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              legendOffset: 50,
              legendPosition: 'middle',
              tickValues: tickValues
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legendOffset: -40,
              legendPosition: 'middle',
              tickValues: 4
            }}
            pointSize={selectedTimePeriod === 'all' ? 4 : 8}
            pointColor="#fc4c02"
            pointBorderWidth={selectedTimePeriod === 'all' ? 1 : 2}
            pointBorderColor={{ from: 'color', modifiers: [] }}
            pointLabelYOffset={-12}
            enableTouchCrosshair={true}
            useMesh={true}
            colors={['#fc4c02']}
            lineWidth={selectedTimePeriod === 'all' ? 2 : 3}
            enablePoints={true}
            enableGridX={false}
            enableGridY={true}
            gridYValues={3}
            enableArea={true}
            areaOpacity={0.1}
            areaBaselineValue={0}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 11,
                fill: '#666',
                outlineWidth: 0,
                outlineColor: 'transparent'
              },
              axis: {
                domain: {
                  line: {
                    stroke: '#ddd',
                    strokeWidth: 1
                  }
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: '#333',
                    fontWeight: 600
                  }
                },
                ticks: {
                  line: {
                    stroke: '#ddd',
                    strokeWidth: 1
                  },
                  text: {
                    fontSize: 10,
                    fill: '#666'
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#f0f0f0',
                  strokeWidth: 1
                }
              },
              crosshair: {
                line: {
                  stroke: '#fc4c02',
                  strokeWidth: 2,
                  strokeOpacity: 0.75
                }
              }
            }}
            tooltip={({ point }) => (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
              >
                <strong>{point.data.x}</strong>
                <br />
                {point.data.yFormatted} miles
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimelineChart; 