import React from 'react';

interface TimeNavigationProps {
  selectedTimePeriod: string;
  timeOffset: number;
  onTimePeriodChange: (timePeriod: string) => void;
  onGoBackward: () => void;
  onGoForward: () => void;
  disabled?: boolean;
}

const TimeNavigation: React.FC<TimeNavigationProps> = ({
  selectedTimePeriod,
  timeOffset,
  onTimePeriodChange,
  onGoBackward,
  onGoForward,
  disabled = false
}) => {
  const getCurrentPeriodLabel = (): string => {
    if (timeOffset === 0) {
      return selectedTimePeriod === 'all' ? 'All Time' : 'Current';
    }
    
    const periods = timeOffset;
    switch (selectedTimePeriod) {
      case 'last month':
        return `${periods} month${periods > 1 ? 's' : ''} ago`;
      case '3 months':
        return `${periods * 3} months ago`;
      case 'last 6 months':
        return `${periods * 6} months ago`;
      case 'last year':
        return `${periods} year${periods > 1 ? 's' : ''} ago`;
      case 'all':
        return 'All Time';
      default:
        return `${periods} period${periods > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <>
      {/* Time Period Selector */}
      <div className="time-period-selector">
        <label htmlFor="time-period">Time Period: </label>
        <select 
          id="time-period" 
          value={selectedTimePeriod} 
          onChange={(e) => onTimePeriodChange(e.target.value)}
          className="time-period-dropdown"
          disabled={disabled}
        >
          <option value="last month">Last Month</option>
          <option value="3 months">3 Months</option>
          <option value="last 6 months">Last 6 Months</option>
          <option value="last year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Time Navigation Controls */}
      {selectedTimePeriod !== 'all' && (
        <div className="time-navigation">
          <button 
            onClick={onGoBackward}
            className="nav-btn nav-backward"
            title="Go back in time"
            disabled={disabled}
          >
            ◀
          </button>
          <span className="current-period-label">
            {getCurrentPeriodLabel()}
          </span>
          <button 
            onClick={onGoForward}
            disabled={timeOffset === 0 || disabled}
            className="nav-btn nav-forward"
            title="Go forward in time"
          >
            ▶
          </button>
        </div>
      )}
    </>
  );
};

export default TimeNavigation; 