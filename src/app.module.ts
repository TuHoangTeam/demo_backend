import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrmModule } from './modules/orm.module'; // Module cấu hình DB chung
import { UserModule } from './modules/user/user.module';
import { ItemModule } from './modules/item/item.module';
// Import module mới tạo
import { RatingModule } from './modules/rating/rating.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    OrmModule, 
    UserModule, 
    ItemModule, 
    RatingModule,
    TransactionModule
  ],
  // CHỈ GIỮ LẠI AppController, xóa các controller khác đi
  // Vì chúng đã nằm trong UserModule, ProductModule, ReviewsModule rồi
  controllers: [AppController], 
  providers: [AppService, Logger],
})
export class AppModule {}