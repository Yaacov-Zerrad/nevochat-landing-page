import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';

interface MetricChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'bar' | 'area';
  dataKeys: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  xAxisKey?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            className="text-xs"
            style={{ color: entry.color }}
          >
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  data,
  type = 'line',
  dataKeys,
  xAxisKey = 'date',
  height = 300,
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey={xAxisKey}
          stroke="#9CA3AF"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="circle"
        />
      </>
    );

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {axes}
            {dataKeys.map((key) => (
              <Bar
                key={key.key}
                dataKey={key.key}
                name={key.label}
                fill={key.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {axes}
            {dataKeys.map((key) => (
              <Area
                key={key.key}
                type="monotone"
                dataKey={key.key}
                name={key.label}
                stroke={key.color}
                fill={key.color}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {axes}
            {dataKeys.map((key) => (
              <Line
                key={key.key}
                type="monotone"
                dataKey={key.key}
                name={key.label}
                stroke={key.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </motion.div>
  );
};
