import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ItemType, ItemStatus } from '../../../entities/item/Item';

export class ItemQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  category?: string;

  @ApiPropertyOptional({ enum: ItemType })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  // --- Geo Filter ---
  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: 'Radius in meters' })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  radius?: number = 5000; // Mặc định 5km

  // --- Pagination ---
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}