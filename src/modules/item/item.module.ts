import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ItemController } from './item.controller';
import { Item } from '../../entities/item/Item';
import { User } from '../../entities/user/User';
import { Category } from '../../entities/item/Category';

@Module({
  imports: [
    MikroOrmModule.forFeature([Item, User, Category]),
    // Cấu hình upload file
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/items', // Nơi lưu ảnh
        filename: (req, file, cb) => {
          // Tạo tên file ngẫu nhiên để không trùng: random + đuôi file gốc
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [ItemController],
  providers: [],
})
export class ItemModule {}