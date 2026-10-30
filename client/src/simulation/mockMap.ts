import type { Cell, Drone, FullMap, GridPosition } from './types';
import { gridConfig } from './gridConfig';
import { droneConfig } from './droneConfig';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIRECTIONS: GridPosition[] = [
  { row: -1, column: 0 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
];

function isInsideGrid(position: GridPosition): boolean {
  return (
    position.row >= 0 &&
    position.row < gridConfig.rows &&
    position.column >= 0 &&
    position.column < gridConfig.columns
  );
}

export function createRandomRoute(start: GridPosition, length: number): GridPosition[] {
  const route: GridPosition[] = [start];
  let current = start;

  while (route.length < length) {
    const direction = DIRECTIONS[randomInt(0, DIRECTIONS.length - 1)];
    const next: GridPosition = {
      row: current.row + direction.row,
      column: current.column + direction.column,
    };
    if (isInsideGrid(next)) {
      route.push(next);
      current = next;
    }
  }

  return route;
}

export function createRandomDrones(): Drone[] {
  const count = randomInt(droneConfig.minCount, droneConfig.maxCount);
  const drones: Drone[] = [];

  for (let id = 0; id < count; id++) {
    const start: GridPosition = {
      row: randomInt(0, gridConfig.rows - 1),
      column: randomInt(0, gridConfig.columns - 1),
    };
    const routeLength = randomInt(droneConfig.minRouteLength, droneConfig.maxRouteLength);

    drones.push({
      id,
      row: start.row,
      column: start.column,
      speed: droneConfig.speed,
      route: createRandomRoute(start, routeLength),
      mode: 'Patrol',
    });
  }

  return drones;
}

function computeRiskLevel(row: number, column: number, drones: Drone[]): number {
  let highestRisk = 0;

  for (const drone of drones) {
    const distance = Math.hypot(row - drone.row, column - drone.column);
    if (distance < droneConfig.threatRadiusCells) {
      const risk = droneConfig.maxRiskLevel * (1 - distance / droneConfig.threatRadiusCells);
      highestRisk = Math.max(highestRisk, risk);
    }
  }

  return Math.round(highestRisk);
}

export function createMap(drones: Drone[]): FullMap {
  const { rows, columns } = gridConfig;
  const cells: Cell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      cells.push({
        row,
        column,
        traversalTime: randomInt(1, 6),
        riskLevel: computeRiskLevel(row, column, drones),
      });
    }
  }

  return { rows, columns, cells };
}