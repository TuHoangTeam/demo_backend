import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Áo phông nam Cotton' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 350000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'Áo phông chất liệu cotton thoáng mát',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
