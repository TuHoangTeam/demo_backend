import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'nguoidung123' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  age!: number;
}