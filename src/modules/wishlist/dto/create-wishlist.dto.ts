import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({ example: 'Bàn học sinh' })
  @IsString()
  @IsNotEmpty()
  keyword!: string;

  @ApiProperty({ description: 'ID danh mục (Optional)', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 5000, description: 'Bán kính tìm kiếm (mét)', default: 5000 })
  @IsNumber()
  @Min(500)
  @Max(50000)
  @IsOptional()
  maxDistance?: number;
}