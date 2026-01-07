import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer'; // Dùng để ép kiểu từ String sang Number
import { ItemCondition, ItemType } from '../../../entities/item/Item';

export class CreateItemDto {
  @ApiProperty({ example: 'Ghế sofa cũ' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Mô tả chi tiết...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'uuid-cua-category' })
  @IsUUID() // Kiểm tra đúng định dạng UUID
  categoryId!: string;

  @ApiProperty({ enum: ItemCondition, example: ItemCondition.GOOD })
  @IsEnum(ItemCondition)
  condition!: ItemCondition;

  @ApiProperty({ enum: ItemType, example: ItemType.GIVE })
  @IsEnum(ItemType)
  type!: ItemType;

  // --- Location Info ---
  @ApiProperty({ example: 'Ký túc xá khu A' })
  @IsString()
  location!: string;

  @ApiProperty({ example: 10.762622 })
  @Type(() => Number) // Ép kiểu string -> number
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: 106.660172 })
  @Type(() => Number) // Ép kiểu string -> number
  @IsNumber()
  longitude!: number;

  @ApiProperty({ example: 3.5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedCO2?: number;

  // Field này dùng để Swagger hiển thị nút upload file
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  images?: any[];
}