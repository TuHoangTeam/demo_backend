import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { WishlistStatus } from '../../../entities/discovery/Wishlist';

export class UpdateWishlistDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxDistance?: number;

  @ApiProperty({ enum: WishlistStatus, required: false })
  @IsEnum(WishlistStatus)
  @IsOptional()
  status?: WishlistStatus;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean;
}