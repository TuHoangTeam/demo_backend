import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Rating 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Giao dịch nhanh gọn, hàng tốt' })
  @IsString()
  comment!: string;

  @ApiProperty()
  @IsInt()
  userId!: number; // Người viết review

  @ApiProperty()
  @IsInt()
  productId!: number; // Sản phẩm được review
}