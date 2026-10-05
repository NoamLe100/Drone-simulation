import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CellDto } from './cell.dto';

export class ChangedCellDto extends CellDto {
  @IsNumber()
  @Min(0)
  traversalTime!: number;

  @IsNumber()
  @Min(0)
  riskLevel!: number;
}

export class ReplanRouteDto {
  @IsString()
  @IsNotEmpty()
  runId!: string;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @ValidateNested()
  @Type(() => CellDto)
  currentPosition!: CellDto;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ChangedCellDto)
  changedCells!: ChangedCellDto[];
}