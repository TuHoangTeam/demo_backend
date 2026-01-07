import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NotificationController } from './notification.controller';
import { Notification } from '../../entities/system/Notification';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationController],
  providers: [],
})
export class NotificationModule {}