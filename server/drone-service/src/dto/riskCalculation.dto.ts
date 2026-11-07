import { Type } from 'class-transformer';
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { CellDto } from './cell.dto';

export class riskCalculationDto {
  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CellDto)
  cells!: CellDto[];
}