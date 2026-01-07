import { ApiProperty } from '@nestjs/swagger';
import { Wishlist, WishlistStatus } from '../../../entities/discovery/Wishlist';

export class WishlistResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  keyword: string;

  @ApiProperty()
  status: WishlistStatus;

  @ApiProperty()
  matchCount: number;

  @ApiProperty()
  maxDistance: number;

  @ApiProperty()
  notificationEnabled: boolean;

  @ApiProperty({ nullable: true })
  category?: { id: string; name: string };

  @ApiProperty()
  createdAt: Date;

  constructor(w: Wishlist) {
    this.id = w.id;
    this.keyword = w.keyword;
    this.status = w.status;
    this.matchCount = w.matchCount ?? 0;
    this.maxDistance = w.maxDistance ?? 5000;
    this.notificationEnabled = w.notificationEnabled ?? true;
    this.createdAt = w.createdAt ?? new Date();

    if (w.category) {
      this.category = {
        id: w.category.id,
        name: w.category.name,
      };
    }
  }
}