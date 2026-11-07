export interface Cell {
  row: number;
  column: number;
  traversalTime: number;
  riskLevel: number;
}
export interface Location{
  row: number;
  column: number;
}
export interface FullMap{
  rows:number;
  columns:number;
  cells:Cell[];
}
export interface Drone {
    speed:number;
    route:Location[];
    routeIndex:number;
    mode:"Attack"|"Patrol"|"Return";
}