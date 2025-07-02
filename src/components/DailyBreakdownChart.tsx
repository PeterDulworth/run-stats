import React from 'react';

interface DailyBreakdownChartProps {
  dailyMiles: number[];
  maxDayMiles: number;
}

const DailyBreakdownChart: React.FC<DailyBreakdownChartProps> = ({ 
  dailyMiles, 
  maxDayMiles 
}) => {
  const dayLabels = ['M', 'T', 'W', 'H', 'F', 'S', 'N'];
  const [hoveredDay, setHoveredDay] = React.useState<number | null>(null);
  
  return (
    <div className="weekly-graph">
      <div className="graph-bars">
        {dailyMiles.map((miles, index) => {
          const height = maxDayMiles > 0 ? (miles / maxDayMiles) * 100 : 0;
          return (
            <div key={index} className="graph-day">
              <div 
                className="graph-bar" 
                style={{ height: `${height}%` }}
                onMouseEnter={() => setHoveredDay(index)}
                onMouseLeave={() => setHoveredDay(null)}
              />
              <span className="graph-label">{dayLabels[index]}</span>
              {hoveredDay === index && miles > 0 && (
                <div className="graph-tooltip">
                  {miles.toFixed(1)} mi
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyBreakdownChart; 