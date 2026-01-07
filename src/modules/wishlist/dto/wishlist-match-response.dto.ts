import { ApiProperty } from '@nestjs/swagger';
import { WishlistMatch } from '../../../entities/discovery/WishlistMatch';
import { ItemResponseDto } from '../../item/dto/item-response.dto'; // Tận dụng DTO của Item

export class WishlistMatchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matchScore: number;

  @ApiProperty()
  notified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ItemResponseDto })
  item: ItemResponseDto;

  constructor(m: WishlistMatch) {
    this.id = m.id;
    this.matchScore = m.matchScore;
    this.notified = m.notified ?? false;
    this.createdAt = m.createdAt ?? new Date();
    
    // Giả sử item đã được populate
    this.item = new ItemResponseDto(m.item);
  }
}