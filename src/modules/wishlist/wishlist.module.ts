import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WishlistController } from './wishlist.controller';

// Import Entities
import { Wishlist } from '../../entities/discovery/Wishlist';
import { WishlistMatch } from '../../entities/discovery/WishlistMatch';
import { Category } from '../../entities/item/Category';
import { User } from '../../entities/user/User';

@Module({
  imports: [
    MikroOrmModule.forFeature([Wishlist, WishlistMatch, Category, User]),
  ],
  controllers: [WishlistController],
  providers: [],
})
export class WishlistModule {}