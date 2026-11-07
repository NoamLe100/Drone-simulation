import {IsInt, IsNumber} from "class-validator";

export class DronseScatteringDto {
    @IsInt()
    rows!: number;
    @IsInt()
    columns!: number;
}