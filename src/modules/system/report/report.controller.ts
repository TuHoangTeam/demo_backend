import { Body, Controller, Post, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';

import { Report, ReportStatus } from '../../../entities/system/Report';
import { User } from '../../../entities/user/User';
import { Item } from '../../../entities/item/Item';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: EntityRepository<Report>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    private readonly em: EntityManager,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a report' })
  async create(@Req() req: any, @Body() dto: CreateReportDto) {
    const reporterId = req.user.id;

    if (!dto.reportedUserId && !dto.reportedItemId) {
      throw new HttpException('Must report a user or an item', HttpStatus.BAD_REQUEST);
    }

    let reportedUser;
    if (dto.reportedUserId) {
      reportedUser = await this.userRepo.findOne(dto.reportedUserId);
      if (!reportedUser) throw new HttpException('Reported user not found', HttpStatus.NOT_FOUND);
    }

    let reportedItem;
    if (dto.reportedItemId) {
      reportedItem = await this.itemRepo.findOne(dto.reportedItemId);
      if (!reportedItem) throw new HttpException('Reported item not found', HttpStatus.NOT_FOUND);
    }

    const report = this.reportRepo.create({
      reporter: reporterId,
      reason: dto.reason,
      description: dto.description,
      status: ReportStatus.PENDING,
      reportedUser,
      reportedItem,
    });

    await this.em.flush();
    return { success: true, message: 'Report submitted successfully' };
  }
}