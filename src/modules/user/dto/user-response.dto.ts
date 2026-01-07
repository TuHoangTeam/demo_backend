import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user/User';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  avatar?: string;

  @ApiProperty({ nullable: true })
  phone?: string;

  @ApiProperty({ nullable: true })
  bio?: string;

  @ApiProperty({ nullable: true })
  location?: string;

  @ApiProperty()
  gPoints: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.avatar = user.avatar;
    this.phone = user.phone;
    this.bio = user.bio;
    this.location = user.location;
    // Dùng ?? 0 để tránh lỗi undefined nếu entity chưa set
    this.gPoints = user.gPoints ?? 0;
    this.rating = user.rating ?? 0;
    this.createdAt = user.createdAt ?? new Date();
  }
}