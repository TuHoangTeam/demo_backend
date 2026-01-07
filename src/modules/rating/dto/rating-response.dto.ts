import { ApiProperty } from '@nestjs/swagger';
import { Rating } from '../../../entities/social/Rating';

export class RatingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rating: number;

  @ApiProperty({ nullable: true })
  comment?: string;

  @ApiProperty()
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty()
  createdAt: Date;

  constructor(r: Rating) {
    this.id = r.id;
    this.rating = r.rating;
    this.comment = r.comment;
    
    // Map người đánh giá
    this.fromUser = {
      id: r.fromUser.id,
      name: r.fromUser.name,
      avatar: r.fromUser.avatar,
    };
    
    // Xử lý ngày tháng null
    this.createdAt = r.createdAt ?? new Date();
  }
}