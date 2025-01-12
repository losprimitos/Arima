// src/components/TimeSeriesChart.tsx

import React, { useMemo } from 'react';
import { TimeSeriesData } from '../types';
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesChartProps {
  data: TimeSeriesData[];   // datos originales
  predictions: number[];    // datos predichos
  title?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  predictions,
  title = 'Time Series Chart',
}) => {
  /**
   * Construimos un array que muestre:
   * - Indices 0..(data.length-1) => real
   * - Indices (data.length)..(data.length+predictions.length-1) => predicted
   *
   * (Opcionalmente, también podríamos superponer predicciones en la parte final)
   */
  const chartData = useMemo(() => {
    const result = [];

    // 1) Datos reales
    for (let i = 0; i < data.length; i++) {
      result.push({
        index: i,
        real: data[i].value,
        predicted: null,
        dateLabel: data[i].date, // para tooltip
      });
    }

    // 2) Datos de predicción
    // Continuamos el eje x a partir de data.length
    for (let j = 0; j < predictions.length; j++) {
      const idx = data.length + j;
      result.push({
        index: idx,
        real: null,
        predicted: predictions[j],
        dateLabel: `Futuro +${j + 1}`,
      });
    }

    return result;
  }, [data, predictions]);

  return (
    <div>
      <h3 className="text-md font-bold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RLineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip
            formatter={(value, name, props) => {
              if (value === null) return 'N/A';
              return value.toFixed ? value.toFixed(2) : value;
            }}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.index === label);
              return item ? item.dateLabel : label;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="real"
            stroke="#8884d8"
            dot={false}
            name="Real"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#82ca9d"
            dot={false}
            name="Predicción"
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
};
