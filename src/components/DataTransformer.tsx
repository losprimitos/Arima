// src/components/DataTransformer.tsx

import React, { useState } from 'react';
import { TimeSeriesData } from '../types';

interface DataTransformerProps {
  rawData: string[][];
  onTransform: (transformedData: TimeSeriesData[]) => void;
  onCancel: () => void;
}

export const DataTransformer: React.FC<DataTransformerProps> = ({
  rawData,
  onTransform,
  onCancel,
}) => {
  const [dateColumnIndex, setDateColumnIndex] = useState<number>(0);
  const [valueColumnIndex, setValueColumnIndex] = useState<number>(1);

  const handleTransform = () => {
    const transformed: TimeSeriesData[] = rawData.map((row) => ({
      date: row[dateColumnIndex],
      value: parseFloat(row[valueColumnIndex]),
    }));

    onTransform(transformed);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium">Índice de la columna de fecha</label>
        <input
          type="number"
          value={dateColumnIndex}
          onChange={(e) => setDateColumnIndex(parseInt(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block font-medium">Índice de la columna de valor</label>
        <input
          type="number"
          value={valueColumnIndex}
          onChange={(e) => setValueColumnIndex(parseInt(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleTransform}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Transformar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
