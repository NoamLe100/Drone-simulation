import { IsInt, Min,IsBoolean } from 'class-validator';

export class CellDto {
  @IsInt()
  @Min(0)
  row!: number;

  @IsInt()
  @Min(0)
  column!: number;

  @IsBoolean()
  drone!:boolean;
}