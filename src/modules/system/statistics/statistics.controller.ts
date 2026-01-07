import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { User } from '../../../entities/user/User';
import { Item } from '../../../entities/item/Item';
import { Transaction } from '../../../entities/commerce/Transaction';

@ApiTags('stats')
@Controller('stats')
export class StatisticsController {
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    @InjectRepository(Transaction) private readonly transRepo: EntityRepository<Transaction>,
  ) {}

  @Get('app')
  @ApiOperation({ summary: 'Get app overview statistics' })
  async getAppStats() {
    const totalUsers = await this.userRepo.count();
    const totalItems = await this.itemRepo.count();
    const totalTransactions = await this.transRepo.count();
    
    // Tính tổng CO2 (Cần query builder để sum, hoặc tính thủ công nếu ít dữ liệu)
    // Cách dùng QueryBuilder để tính Sum:
    const qb = this.userRepo.createQueryBuilder('u');
    const co2Result = await qb.select('sum(u.total_co2_saved) as total').execute();
    const totalCO2Saved = co2Result[0] ? (co2Result[0] as any).total : 0;

    return {
      totalUsers,
      totalItems,
      totalTransactions,
      totalCO2Saved: Number(totalCO2Saved),
    };
  }
}