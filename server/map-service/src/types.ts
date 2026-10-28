export interface Cell {
  row: number;
  column: number;
  traversalTime: number;
  riskLevel: number;
  drone:boolean;
}
export interface FullMap{
  rows:number;
  columns:number;
  cells:Cell[];
}
export interface Doner {
    speed:number;
    road:Cell[];
    mode:"Attack"|"patrole"|"return";
}