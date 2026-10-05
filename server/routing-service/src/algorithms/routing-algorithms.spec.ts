import { aStar } from './astar';
import { buildCostGrid } from './costGrid';
import { DStarLite } from './dstarLite';

describe('routing algorithms', () => {
  it('builds additive costs and lets A* trade a countermeasure for lower risk', () => {
    const costGrid = buildCostGrid({
      rows: 1,
      columns: 3,
      traversalTimes: [1, 1, 1],
      riskLevels: [0, 10, 0],
      resourcePenalty: 2,
    });

    expect(costGrid.cells[1].baseCost).toBe(11);
    expect(costGrid.cells[1].resourceUseCost).toBe(3);
    expect(
      aStar(costGrid, { row: 0, column: 0 }, { row: 0, column: 2 }, 1),
    ).toMatchObject({
      totalCost: 4,
      resourcePlan: [
        { consumed: true, remainingCountermeasures: 0 },
        { consumed: false, remainingCountermeasures: 0 },
      ],
    });
  });

  it('updates changed costs incrementally and restores its serialized search state', () => {
    const costGrid = buildCostGrid({
      rows: 3,
      columns: 3,
      traversalTimes: Array(9).fill(1),
      riskLevels: Array(9).fill(0),
      resourcePenalty: 2,
    });
    const dstar = new DStarLite();
    dstar.initialize(costGrid, { row: 1, column: 0 }, { row: 1, column: 2 });
    dstar.computeShortestPath();

    dstar.updateChangedCosts([{ row: 1, column: 1, traversalTime: 1, riskLevel: 100 }]);
    dstar.computeShortestPath();
    expect(dstar.getPath()?.some((cell) => cell.row === 1 && cell.column === 1)).toBe(false);

    const restored = new DStarLite(dstar.getState());
    restored.updateChangedCosts([{ row: 1, column: 1, traversalTime: 1, riskLevel: 0 }]);
    restored.computeShortestPath();
    expect(restored.getPath()).toEqual([
      { row: 1, column: 0 },
      { row: 1, column: 1 },
      { row: 1, column: 2 },
    ]);
  });

  it('finds a route through zero-cost cells without looping', () => {
    const costGrid = buildCostGrid({
      rows: 2,
      columns: 3,
      traversalTimes: Array(6).fill(0),
      riskLevels: Array(6).fill(0),
      resourcePenalty: 0,
    });
    const dstar = new DStarLite();
    dstar.initialize(costGrid, { row: 0, column: 0 }, { row: 1, column: 2 });
    dstar.computeShortestPath();

    expect(dstar.getPath()?.at(-1)).toEqual({ row: 1, column: 2 });
  });
});