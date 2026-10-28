import { PriorityQueue } from './priority-queue';
import { assertCellInGrid, cellFromIndex, cellIndex, neighbors, Cell, CostGrid } from './types';

interface OpenEntry {
  state: number;
  estimate: number;
  cost: number;
}

export interface ResourceStep {
  cell: Cell;
  consumed: boolean;
  remainingCountermeasures: number;
}

export interface AStarResult {
  path: Cell[];
  resourcePlan: ResourceStep[];
  totalCost: number;
}

export function aStar(
  costGrid: CostGrid,
  start: Cell,
  goal: Cell,
  initialCountermeasures: number,
): AStarResult | null {
  assertCellInGrid(start, costGrid);
  assertCellInGrid(goal, costGrid);
  if (!Number.isInteger(initialCountermeasures) || initialCountermeasures < 0) {
    throw new RangeError('Initial countermeasures must be a non-negative integer');
  }

  const resourceStates = initialCountermeasures + 1;
  const stateId = (index: number, remaining: number) => index * resourceStates + remaining;
  const startIndex = cellIndex(start, costGrid.columns);
  const goalIndex = cellIndex(goal, costGrid.columns);
  const startState = stateId(startIndex, initialCountermeasures);
  const distances = new Map<number, number>([[startState, 0]]);
  const previous = new Map<number, { state: number; consumed: boolean }>();
  const minimumStepCost = costGrid.cells.reduce(
    (minimum, cell) => Math.min(minimum, cell.baseCost, cell.resourceUseCost),
    Infinity,
  );
  const open = new PriorityQueue<OpenEntry>((left, right) =>
    left.estimate === right.estimate ? left.cost - right.cost : left.estimate - right.estimate,
  );
  open.push({ state: startState, cost: 0, estimate: heuristic(startIndex) });

  let finalState: number | undefined;
  while (open.size > 0) {
    const current = open.pop()!;
    if (current.cost !== distances.get(current.state)) continue;
    const currentIndex = Math.floor(current.state / resourceStates);
    const remaining = current.state % resourceStates;
    if (currentIndex === goalIndex) {
      finalState = current.state;
      break;
    }

    for (const nextIndex of neighbors(currentIndex, costGrid.rows, costGrid.columns)) {
      const cell = costGrid.cells[nextIndex];
      relax(nextIndex, remaining, false, cell.baseCost);
      if (remaining > 0) relax(nextIndex, remaining - 1, true, cell.resourceUseCost);
    }

    function relax(nextIndex: number, nextRemaining: number, consumed: boolean, stepCost: number): void {
      const nextState = stateId(nextIndex, nextRemaining);
      const nextCost = current.cost + stepCost;
      if (nextCost >= (distances.get(nextState) ?? Infinity)) return;
      distances.set(nextState, nextCost);
      previous.set(nextState, { state: current.state, consumed });
      open.push({
        state: nextState,
        cost: nextCost,
        estimate: nextCost + heuristic(nextIndex),
      });
    }
  }

  if (finalState === undefined) return null;
  const steps: ResourceStep[] = [];
  let currentState = finalState;
  while (currentState !== startState) {
    const prior = previous.get(currentState);
    if (!prior) return null;
    const index = Math.floor(currentState / resourceStates);
    steps.push({
      cell: cellFromIndex(index, costGrid.columns),
      consumed: prior.consumed,
      remainingCountermeasures: currentState % resourceStates,
    });
    currentState = prior.state;
  }
  steps.reverse();

  return {
    path: [start, ...steps.map((step) => step.cell)],
    resourcePlan: steps,
    totalCost: distances.get(finalState)!,
  };

  function heuristic(index: number): number {
    const cell = cellFromIndex(index, costGrid.columns);
    const distance = Math.abs(cell.row - goal.row) + Math.abs(cell.column - goal.column);
    return distance * (minimumStepCost === Infinity ? 0 : minimumStepCost);
  }
}