import { IsString,IsNotEmpty } from "class-validator";

export class GetMapDto{
  @IsString()
  @IsNotEmpty()
  MapId!: string;
}