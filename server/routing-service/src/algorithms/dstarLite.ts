import { PriorityQueue } from './priority-queue';
import {
  assertCellInGrid,
  cellFromIndex,
  cellIndex,
  Cell,
  ChangedCell,
  CostGrid,
  neighbors,
} from './types';

export type DStarKey = [number, number];

export interface DStarQueueEntry {
  index: number;
  key: DStarKey;
}

export interface DStarLiteState {
  costGrid: CostGrid;
  start: Cell;
  lastStart: Cell;
  goal: Cell;
  km: number;
  g: number[];
  rhs: number[];
  queue: DStarQueueEntry[];
}

export class DStarLite {
  private costGrid!: CostGrid;
  private start!: Cell;
  private lastStart!: Cell;
  private goal!: Cell;
  private km = 0;
  private g: number[] = [];
  private rhs: number[] = [];
  private queue = new PriorityQueue<DStarQueueEntry>((left, right) => compareKeys(left.key, right.key));
  private readonly queueKeys = new Map<number, DStarKey>();

  constructor(state?: DStarLiteState) {
    if (state) this.loadState(state);
  }

  initialize(costGrid: CostGrid, start: Cell, goal: Cell): void {
    assertCellInGrid(start, costGrid);
    assertCellInGrid(goal, costGrid);
    this.costGrid = structuredClone(costGrid);
    this.start = { ...start };
    this.lastStart = { ...start };
    this.goal = { ...goal };
    this.km = 0;
    this.g = Array(costGrid.cells.length).fill(Infinity);
    this.rhs = Array(costGrid.cells.length).fill(Infinity);
    this.queue = new PriorityQueue<DStarQueueEntry>((left, right) => compareKeys(left.key, right.key));
    this.queueKeys.clear();
    const goalIndex = cellIndex(goal, costGrid.columns);
    this.rhs[goalIndex] = 0;
    this.enqueue(goalIndex, this.calculateKey(goalIndex));
  }

  updateVertex(index: number): void {
    if (index !== cellIndex(this.goal, this.costGrid.columns)) {
      this.rhs[index] = Math.min(
        ...neighbors(index, this.costGrid.rows, this.costGrid.columns).map(
          (successor) => this.edgeCost(successor) + this.g[successor],
        ),
      );
    }
    if (this.g[index] !== this.rhs[index]) {
      this.enqueue(index, this.calculateKey(index));
    } else {
      this.queueKeys.delete(index);
    }
  }

  computeShortestPath(): void {
    const startIndex = cellIndex(this.start, this.costGrid.columns);
    while (true) {
      this.discardStaleQueueEntries();
      const top = this.queue.peek();
      if (
        !top ||
        (compareKeys(top.key, this.calculateKey(startIndex)) >= 0 &&
          this.rhs[startIndex] === this.g[startIndex])
      ) {
        break;
      }
      const entry = this.queue.pop()!;
      this.queueKeys.delete(entry.index);
      const newKey = this.calculateKey(entry.index);
      if (compareKeys(entry.key, newKey) < 0) {
        this.enqueue(entry.index, newKey);
      } else if (this.g[entry.index] > this.rhs[entry.index]) {
        this.g[entry.index] = this.rhs[entry.index];
        for (const predecessor of neighbors(entry.index, this.costGrid.rows, this.costGrid.columns)) {
          this.updateVertex(predecessor);
        }
      } else {
        this.g[entry.index] = Infinity;
        this.updateVertex(entry.index);
        for (const predecessor of neighbors(entry.index, this.costGrid.rows, this.costGrid.columns)) {
          this.updateVertex(predecessor);
        }
      }
    }
  }

  updateChangedCosts(changes: ChangedCell[]): void {
    const affected = new Set<number>();
    for (const change of changes) {
      assertCellInGrid(change, this.costGrid);
      if (
        !Number.isFinite(change.traversalTime) ||
        change.traversalTime < 0 ||
        !Number.isFinite(change.riskLevel) ||
        change.riskLevel < 0
      ) {
        throw new RangeError('Changed cell costs must be finite and non-negative');
      }
      const index = cellIndex(change, this.costGrid.columns);
      const cell = this.costGrid.cells[index];
      const resourcePenalty = cell.resourceUseCost - cell.traversalTime;
      cell.traversalTime = change.traversalTime;
      cell.riskLevel = change.riskLevel;
      cell.baseCost = change.traversalTime + change.riskLevel;
      cell.resourceUseCost = change.traversalTime + resourcePenalty;
      affected.add(index);
      for (const predecessor of neighbors(index, this.costGrid.rows, this.costGrid.columns)) {
        affected.add(predecessor);
      }
    }
    for (const index of affected) this.updateVertex(index);
  }

  moveStart(start: Cell): void {
    assertCellInGrid(start, this.costGrid);
    this.km += this.heuristic(this.lastStart, start);
    this.lastStart = { ...start };
    this.start = { ...start };
  }

  getPath(): Cell[] | null {
    const startIndex = cellIndex(this.start, this.costGrid.columns);
    if (!Number.isFinite(this.g[startIndex])) return null;
    const goalIndex = cellIndex(this.goal, this.costGrid.columns);
    const path = [startIndex];
    const visited = new Set(path);
    const stack = [{ choices: this.pathChoices(startIndex), nextChoice: 0 }];

    while (path.length > 0) {
      const current = path[path.length - 1];
      if (current === goalIndex) {
        return path.map((index) => cellFromIndex(index, this.costGrid.columns));
      }
      const frame = stack[stack.length - 1];
      let next: number | undefined;
      while (frame.nextChoice < frame.choices.length) {
        const candidate = frame.choices[frame.nextChoice++];
        if (!visited.has(candidate)) {
          next = candidate;
          break;
        }
      }
      if (next === undefined) {
        visited.delete(path.pop()!);
        stack.pop();
      } else {
        visited.add(next);
        path.push(next);
        stack.push({ choices: this.pathChoices(next), nextChoice: 0 });
      }
    }
    return null;
  }

  getState(): DStarLiteState {
    return {
      costGrid: structuredClone(this.costGrid),
      start: { ...this.start },
      lastStart: { ...this.lastStart },
      goal: { ...this.goal },
      km: this.km,
      g: [...this.g],
      rhs: [...this.rhs],
      queue: this.queue
        .toArray()
        .filter((entry) => compareKeys(this.queueKeys.get(entry.index) ?? [Infinity, Infinity], entry.key) === 0)
        .map((entry) => ({ index: entry.index, key: [...entry.key] })),
    };
  }

  loadState(state: DStarLiteState): void {
    const size = state.costGrid.rows * state.costGrid.columns;
    if (
      state.costGrid.cells.length !== size ||
      state.g.length !== size ||
      state.rhs.length !== size
    ) {
      throw new RangeError('Invalid D* Lite state dimensions');
    }
    this.costGrid = structuredClone(state.costGrid);
    this.start = { ...state.start };
    this.lastStart = { ...state.lastStart };
    this.goal = { ...state.goal };
    this.km = state.km;
    this.g = [...state.g];
    this.rhs = [...state.rhs];
    this.queue = new PriorityQueue<DStarQueueEntry>(
      (left, right) => compareKeys(left.key, right.key),
      state.queue.map((entry) => ({ index: entry.index, key: [...entry.key] })),
    );
    this.queueKeys.clear();
    for (const entry of state.queue) this.queueKeys.set(entry.index, [...entry.key]);
  }

  private enqueue(index: number, key: DStarKey): void {
    this.queueKeys.set(index, [...key]);
    this.queue.push({ index, key: [...key] });
  }

  private discardStaleQueueEntries(): void {
    while (this.queue.peek()) {
      const entry = this.queue.peek()!;
      if (compareKeys(this.queueKeys.get(entry.index) ?? [Infinity, Infinity], entry.key) === 0) return;
      this.queue.pop();
    }
  }

  private edgeCost(destinationIndex: number): number {
    return this.costGrid.cells[destinationIndex].baseCost;
  }

  private pathChoices(index: number): number[] {
    return neighbors(index, this.costGrid.rows, this.costGrid.columns)
      .map((neighbor) => ({ neighbor, cost: this.edgeCost(neighbor) + this.g[neighbor] }))
      .filter(({ cost }) => Number.isFinite(cost) && cost === this.g[index])
      .sort((left, right) => left.cost - right.cost)
      .map(({ neighbor }) => neighbor);
  }

  private calculateKey(index: number): DStarKey {
    const minimum = Math.min(this.g[index], this.rhs[index]);
    return [
      minimum + this.heuristic(this.start, cellFromIndex(index, this.costGrid.columns)) + this.km,
      minimum,
    ];
  }

  private heuristic(from: Cell, to: Cell): number {
    return 0;
  }
}

function compareKeys(left: DStarKey, right: DStarKey): number {
  return left[0] === right[0] ? left[1] - right[1] : left[0] - right[0];
}