import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user/User';

export class LeaderboardResponseDto {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  user: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty()
  totalCO2Saved: number;

  @ApiProperty()
  totalItemsGiven: number;

  constructor(user: User, rank: number) {
    this.rank = rank;
    this.user = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    };
    this.totalCO2Saved = user.totalCO2Saved ?? 0;
    this.totalItemsGiven = user.totalItemsGiven ?? 0;
  }
}