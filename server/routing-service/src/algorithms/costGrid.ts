import { CostGrid } from './types';

export interface CostGridInput {
  rows: number;
  columns: number;
  traversalTimes: number[];
  riskLevels: number[];
  resourcePenalty: number;
}

export function buildCostGrid(input: CostGridInput): CostGrid {
  const { rows, columns, traversalTimes, riskLevels, resourcePenalty } = input;
  if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(columns) || columns < 1) {
    throw new RangeError('Grid dimensions must be positive integers');
  }
  if (traversalTimes.length !== rows * columns || riskLevels.length !== rows * columns) {
    throw new RangeError('Traversal-time and risk arrays must match the grid dimensions');
  }
  if (!Number.isFinite(resourcePenalty) || resourcePenalty < 0) {
    throw new RangeError('Resource penalty must be a finite non-negative number');
  }

  const cells = traversalTimes.map((traversalTime, index) => {
    const riskLevel = riskLevels[index];
    if (!Number.isFinite(traversalTime) || traversalTime < 0) {
      throw new RangeError(`Traversal time at index ${index} must be finite and non-negative`);
    }
    if (!Number.isFinite(riskLevel) || riskLevel < 0) {
      throw new RangeError(`Risk level at index ${index} must be finite and non-negative`);
    }
    return {
      traversalTime,
      riskLevel,
      baseCost: traversalTime + riskLevel,
      resourceUseCost: traversalTime + resourcePenalty,
    };
  });

  return { rows, columns, cells };
}