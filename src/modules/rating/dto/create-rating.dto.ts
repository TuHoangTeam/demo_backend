import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ description: 'ID của giao dịch cần đánh giá' })
  @IsUUID()
  @IsNotEmpty()
  transactionId!: string;

  @ApiProperty({ description: 'ID của người được đánh giá (đối phương)' })
  @IsUUID()
  @IsNotEmpty()
  toUserId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Giao dịch nhanh gọn, rất nhiệt tình!', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}