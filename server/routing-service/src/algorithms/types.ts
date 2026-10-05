export interface Cell {
  row: number;
  column: number;
}

export interface CostCell {
  traversalTime: number;
  riskLevel: number;
  baseCost: number;
  resourceUseCost: number;
}

export interface CostGrid {
  rows: number;
  columns: number;
  cells: CostCell[];
}

export interface ChangedCell extends Cell {
  traversalTime: number;
  riskLevel: number;
}

export function cellIndex(cell: Cell, columns: number): number {
  return cell.row * columns + cell.column;
}

export function cellFromIndex(index: number, columns: number): Cell {
  return { row: Math.floor(index / columns), column: index % columns };
}

export function assertCellInGrid(cell: Cell, grid: Pick<CostGrid, 'rows' | 'columns'>): void {
  if (
    !Number.isInteger(cell.row) ||
    !Number.isInteger(cell.column) ||
    cell.row < 0 ||
    cell.column < 0 ||
    cell.row >= grid.rows ||
    cell.column >= grid.columns
  ) {
    throw new RangeError(`Cell (${cell.row}, ${cell.column}) is outside the grid`);
  }
}

export function neighbors(index: number, rows: number, columns: number): number[] {
  const { row, column } = cellFromIndex(index, columns);
  const result: number[] = [];
  if (row > 0) result.push(index - columns);
  if (column + 1 < columns) result.push(index + 1);
  if (row + 1 < rows) result.push(index + columns);
  if (column > 0) result.push(index - 1);
  return result;
}