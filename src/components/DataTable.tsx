// src/components/DataTable.tsx

import React from 'react';
import { TimeSeriesData } from '../types';

interface DataTableProps {
  data: TimeSeriesData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          <th className="border px-2 py-1">Fecha</th>
          <th className="border px-2 py-1">Valor</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td className="border px-2 py-1">{d.date}</td>
            <td className="border px-2 py-1">{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
