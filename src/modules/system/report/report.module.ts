import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReportController } from './report.controller';
import { Report } from '../../../entities/system/Report';
import { User } from '../../../entities/user/User';
import { Item } from '../../../entities/item/Item';

@Module({
  imports: [MikroOrmModule.forFeature([Report, User, Item])],
  controllers: [ReportController],
})
export class ReportModule {}