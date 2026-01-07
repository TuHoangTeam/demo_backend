import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ItemController } from './item.controller';

// Entities
import { Item } from '../../entities/item/Item';
import { User } from '../../entities/user/User';
import { Category } from '../../entities/item/Category';
import { Favorite } from '../../entities/item/Favorite'; // <--- 1. Import Entity này

@Module({
  imports: [
    // 2. Thêm Favorite vào danh sách đăng ký
    MikroOrmModule.forFeature([Item, User, Category, Favorite]), 
    
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/items',
        filename: (req, file, cb) => {
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