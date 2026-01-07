import { Logger } from '@nestjs/common';
import { defineConfig } from '@mikro-orm/postgresql';
// 1. User Group
import { User } from './entities/user/User';

// 2. Item Group
import { Item } from './entities/item/Item';
import { Category } from './entities/item/Category';
import { Favorite } from './entities/item/Favorite';

// 3. Commerce Group
import { Transaction } from './entities/commerce/Transaction';
import { PointTransaction } from './entities/commerce/PointTransaction';

// 4. Social Group
import { Rating } from './entities/social/Rating';
import { Conversation } from './entities/social/Conversation';
import { Message } from './entities/social/Message';

// 5. Discovery Group
import { Wishlist } from './entities/discovery/Wishlist';
import { WishlistMatch } from './entities/discovery/WishlistMatch';

// 6. Gamification Group
import { Achievement } from './entities/gamification/Achievement';
import { UserAchievement } from './entities/gamification/UserAchievement';

// 7. System Group
import { Notification } from './entities/system/Notification';
import { Report } from './entities/system/Report';

const logger = new Logger('MikroORM');

export default defineConfig({
  entities: [
    User,
    Item,
    Category,
    Favorite,
    Transaction,
    PointTransaction,
    Rating,
    Conversation,
    Message,
    Wishlist,
    WishlistMatch,
    Achievement,
    UserAchievement,
    Notification,
    Report
  ],
  dbName: 'mobile-demo',
  port: 5432,
  debug: true,
  logger: logger.log.bind(logger),

  user: process.env.POSTGRES_USERNAME ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres'
});