// src/types.ts

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface TimeSeriesData {
  date: string;
  value: number;
}
