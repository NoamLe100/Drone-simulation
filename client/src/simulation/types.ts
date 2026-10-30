export interface Cell {
  row: number;
  column: number;
  traversalTime: number;
  riskLevel: number;
}
export interface FullMap{
  rows:number;
  columns:number;
  cells:Cell[];
}
export interface GridPosition {
  row: number;
  column: number;
}

export interface DangerZone {
  row:number;
  column:number;
  radiusCells:number;
  maxRiskLevel:number;
}
export interface Drone {
  id: number;
  row: number;
  column: number;
  speed: number;
  route: GridPosition[];
  mode: 'Attack' | 'Patrol' | 'Return';
}