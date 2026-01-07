import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FavoriteController } from './favorite.controller';

// Import Entities
import { Favorite } from '../../entities/item/Favorite';
import { Item } from '../../entities/item/Item';

@Module({
  imports: [
    MikroOrmModule.forFeature([Favorite, Item]),
  ],
  controllers: [FavoriteController],
  providers: [],
})
export class FavoriteModule {}