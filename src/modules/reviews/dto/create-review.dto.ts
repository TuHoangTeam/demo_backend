import { IsString, IsInt, Min, Max, IsOptional, IsPositive } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  // --- PHẢI CÓ TRƯỜNG NÀY ---
  @IsInt()
  @IsPositive() // Đảm bảo là số dương
  productId: number;
}