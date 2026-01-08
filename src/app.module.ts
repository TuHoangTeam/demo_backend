import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import Module Database (nếu bạn tách riêng, hoặc dùng MikroOrmModule.forRoot ở đây)
import { OrmModule } from './modules/orm.module'; 

// --- IMPORT CÁC MODULE CHỨC NĂNG ---
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ItemModule } from './modules/item/item.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { RatingModule } from './modules/rating/rating.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { GamificationModule } from './modules/gamification/gamification.module';

// --- IMPORT CÁC MODULE HỆ THỐNG (ADMIN) ---
import { CategoryModule } from './modules/system/category/category.module';
import { ReportModule } from './modules/system/report/report.module';
import { AchievementModule } from './modules/system/achievement/achievement.module';
import { StatisticsModule } from './modules/system/statistics/statistics.module';

@Module({
  imports: [
    // 1. Cấu hình Config (Load .env)
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
    }),

    // 2. Database
    OrmModule, 

    // 3. Các Feature Modules
    AuthModule,
    UserModule,
    ItemModule,
    TransactionModule,
    RatingModule,
    WishlistModule,
    NotificationModule,
    FavoriteModule,
    GamificationModule,

    // 4. System Modules
    CategoryModule,
    ReportModule,
    AchievementModule,
    StatisticsModule,
  ],
  controllers: [AppController], 
  providers: [AppService, Logger],
})
export class AppModule {}