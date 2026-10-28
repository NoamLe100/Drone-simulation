import { IsInt, Min, ValidateNested,IsArray,ArrayMinSize,Type} from 'class-validator';
import {CellDto} from "./cell.dto"
 
export class MapDto {
    @IsInt()
    @Min(1)
    rows!:number

    @IsInt()
    @Min(1)
    columns!:number

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @Type(() => CellDto)
    cells!: CellDto;
}