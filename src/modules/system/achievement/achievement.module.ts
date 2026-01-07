import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AchievementController } from './achievement.controller';
import { Achievement } from '../../../entities/gamification/Achievement';
import { UserAchievement } from '../../../entities/gamification/UserAchievement';

@Module({
  imports: [MikroOrmModule.forFeature([Achievement, UserAchievement])],
  controllers: [AchievementController],
})
export class AchievementModule {}