import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 11 Cũ' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Máy còn mới 90%, trầy xước nhẹ' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Used' })
  @IsString()
  status!: string;

  @ApiProperty({ example: 5000000 })
  @IsInt()
  price!: number;
  
  // Mặc định tạo mới sẽ là available, nhưng cứ để đây nếu cần
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  available?: boolean = true;

  @ApiProperty({ example: 1, description: 'ID của người bán' })
  @IsInt()
  ownerId!: number;
}