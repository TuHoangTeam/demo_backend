import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { PointController } from './point.controller';
import { EcoController } from './eco.controller';

// Entities
import { User } from '../../entities/user/User';
import { PointTransaction } from '../../entities/commerce/PointTransaction';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, PointTransaction]),
  ],
  controllers: [PointController, EcoController],
  providers: [],
})
export class GamificationModule {}