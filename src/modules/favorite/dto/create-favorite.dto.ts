import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID của món đồ muốn yêu thích' })
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;
}