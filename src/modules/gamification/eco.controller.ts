import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';

import { User } from '../../entities/user/User';
import { EcoImpactResponseDto } from './dto/eco-impact-response.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';

@ApiTags('eco')
@Controller('eco')
export class EcoController {
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
  ) {}

  // 1. TÁC ĐỘNG MÔI TRƯỜNG CỦA TÔI
  @Get('impact/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my eco impact' })
  async getMyImpact(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    
    // Nếu không tìm thấy (hiếm), trả về object rỗng hoặc throw
    if (!user) return {};

    return new EcoImpactResponseDto(user);
  }

  // 2. BẢNG XẾP HẠNG (LEADERBOARD)
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get eco leaderboard' })
  @ApiQuery({ name: 'limit', required: false })
  async getLeaderboard(@Query('limit') limit: number = 10) {
    // Lấy Top user có CO2 saved cao nhất
    const topUsers = await this.userRepo.find(
      {}, // filter: all users
      {
        orderBy: { totalCO2Saved: QueryOrder.DESC },
        limit: Number(limit),
      }
    );

    return topUsers.map((user, index) => new LeaderboardResponseDto(user, index + 1));
  }
}