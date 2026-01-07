import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { Achievement, AchievementStatus } from '../../../entities/gamification/Achievement';
import { UserAchievement } from '../../../entities/gamification/UserAchievement';
import { AchievementResponseDto } from './dto/achievement-response.dto';

@ApiTags('achievements')
@Controller('achievements')
export class AchievementController {
  constructor(
    @InjectRepository(Achievement) private readonly achRepo: EntityRepository<Achievement>,
    @InjectRepository(UserAchievement) private readonly userAchRepo: EntityRepository<UserAchievement>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements' })
  async findAll() {
    const achievements = await this.achRepo.find({ status: AchievementStatus.ACTIVE });
    return achievements.map(a => new AchievementResponseDto(a));
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my achievements progress' })
  async getMyAchievements(@Req() req: any) {
    const userId = req.user.id;

    const allAchievements = await this.achRepo.find({ status: AchievementStatus.ACTIVE });
    const myProgress = await this.userAchRepo.find({ user: userId });

    return allAchievements.map(ach => {
      const userProgress = myProgress.find(ua => ua.achievement.id === ach.id);
      return new AchievementResponseDto(
        ach, 
        userProgress?.progress ?? 0, 
        userProgress?.isCompleted ?? false
      );
    });
  }
}