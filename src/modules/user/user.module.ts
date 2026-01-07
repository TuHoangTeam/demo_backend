import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MulterModule } from '@nestjs/platform-express'; // Cần thiết cho upload

import { UserController } from './user.controller';
import { User } from '../../entities/user/User';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    // Nếu muốn cấu hình Multer global thì làm ở đây, 
    // nhưng ta đã cấu hình trực tiếp trong Controller nên chỉ cần import module rỗng
    MulterModule.register(),
  ],
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class UserModule {}