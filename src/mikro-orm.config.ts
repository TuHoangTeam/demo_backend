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
  // Ưu tiên lấy từ biến môi trường, fallback về giá trị mặc định local
  dbName: process.env.DB_NAME || 'mobile-demo',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',

  debug: process.env.NODE_ENV !== 'production',
  logger: logger.log.bind(logger),
});