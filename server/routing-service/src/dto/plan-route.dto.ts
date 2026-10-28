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

export class PlanRouteDto {
  @IsString()
  @IsNotEmpty()
  runId!: string;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  columns!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  traversalTimes!: number[];

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  riskLevels!: number[];

  @IsNumber()
  @Min(0)
  resourcePenalty!: number;

  @IsInt()
  @Min(0)
  initialCountermeasures!: number;

  @ValidateNested()
  @Type(() => CellDto)
  start!: CellDto;

  @ValidateNested()
  @Type(() => CellDto)
  goal!: CellDto;
}