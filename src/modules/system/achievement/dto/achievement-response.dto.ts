import { ApiProperty } from '@nestjs/swagger';
import { Achievement } from '../../../../entities/gamification/Achievement';

export class AchievementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  rewardPoints: number;

  @ApiProperty({ nullable: true })
  isCompleted?: boolean;

  @ApiProperty({ nullable: true })
  progress?: number;

  constructor(a: Achievement, progress = 0, isCompleted = false) {
    this.id = a.id;
    this.name = a.name;
    this.description = a.description;
    this.icon = a.icon;
    this.rewardPoints = a.rewardPoints;
    this.progress = progress;
    this.isCompleted = isCompleted;
  }
}