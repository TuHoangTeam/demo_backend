import { Controller, Get, Param, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/core';

import { User } from '../../entities/user/User';
import { PointTransaction } from '../../entities/commerce/PointTransaction';
import { PointHistoryResponseDto } from './dto/point-history-response.dto';

@ApiTags('points')
@Controller('points')
export class PointController {
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(PointTransaction) private readonly pointRepo: EntityRepository<PointTransaction>,
  ) {}

  // 1. XEM SỐ DƯ
  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current point balance' })
  async getBalance(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    return {
      gPoints: user?.gPoints ?? 0,
      rank: (user?.gPoints ?? 0) > 1000 ? 'Gold' : 'Silver', // Logic rank ví dụ
    };
  }

  // 2. LỊCH SỬ GIAO DỊCH ĐIỂM
  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get point transaction history' })
  @ApiQuery({ name: 'limit', required: false })
  async getHistory(@Req() req: any, @Query('limit') limit: number = 20) {
    const userId = req.user.id;
    
    const history = await this.pointRepo.find(
      { user: userId },
      { 
        orderBy: { createdAt: QueryOrder.DESC },
        limit: Number(limit)
      }
    );

    return history.map(pt => new PointHistoryResponseDto(pt));
  }

  // 3. KIỂM TRA ĐỦ ĐIỂM KHÔNG (Dùng cho Client check nhanh)
  @Get('check/:amount')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has sufficient points' })
  async checkSufficient(@Req() req: any, @Param('amount', ParseIntPipe) amount: number) {
    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    const currentBalance = user?.gPoints ?? 0;

    return {
      sufficient: currentBalance >= amount,
      currentBalance,
      required: amount
    };
  }
}