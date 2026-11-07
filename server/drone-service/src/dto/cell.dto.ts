import { IsInt, Min } from 'class-validator';

export class CellDto {
  @IsInt()
  @Min(0)
  row!: number;

  @IsInt()
  @Min(0)
  column!: number;

  @IsInt()
  @Min(1)
  traversalTime!: number;

  @IsInt()
  @Min(0)
  riskLevel!: number;
}