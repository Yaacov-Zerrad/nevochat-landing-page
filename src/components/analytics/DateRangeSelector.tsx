import React, { useState } from 'react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

export interface DateRange {
  start_date: string;
  end_date: string;
  label: string;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presetRanges = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      start_date: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      label: 'Last 7 days',
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start_date: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      label: 'Last 30 days',
    }),
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      start_date: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      label: 'Last 3 months',
    }),
  },
  {
    label: 'Last 6 months',
    getValue: () => ({
      start_date: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      label: 'Last 6 months',
    }),
  },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(value.start_date);
  const [customEnd, setCustomEnd] = useState(value.end_date);

  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    onChange(preset.getValue());
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange({
        start_date: customStart,
        end_date: customEnd,
        label: 'Custom range',
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">Date Range</h3>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showCustom ? 'Show Presets' : 'Custom Range'}
        </button>
      </div>

      {!showCustom ? (
        <div className="flex flex-wrap gap-2">
          {presetRanges.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                value.label === preset.label
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleCustomApply}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Apply Custom Range
          </button>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Selected: <span className="text-gray-300 font-medium">{value.label}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {value.start_date} to {value.end_date}
        </p>
      </div>
    </div>
  );
};
