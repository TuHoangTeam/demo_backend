import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrmModule } from './modules/orm.module'; // Module cấu hình DB chung
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
// Import module mới tạo
import { ReviewsModule } from './modules/reviews/reviews.module'; 

@Module({
  imports: [
    OrmModule, 
    UserModule, 
    ProductModule, 
    ReviewsModule // Thêm vào đây
  ],
  // CHỈ GIỮ LẠI AppController, xóa các controller khác đi
  // Vì chúng đã nằm trong UserModule, ProductModule, ReviewsModule rồi
  controllers: [AppController], 
  providers: [AppService, Logger],
})
export class AppModule {}