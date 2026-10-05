import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: 'correct-horse-battery-staple', maxLength: 72, writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}