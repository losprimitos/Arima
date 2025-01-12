// src/components/TrainingProgress.tsx

import React from 'react';

interface TrainingProgressProps {
  currentEpoch: number;
  totalEpochs: number;
  loss: number | null;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  currentEpoch,
  totalEpochs,
  loss,
}) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-100 rounded">
      <p>
        Epoch: {currentEpoch}/{totalEpochs}
      </p>
      <p>Loss: {loss !== null ? loss.toFixed(4) : 'N/A'}</p>
    </div>
  );
};
