import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrmModule } from './modules/orm.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ProductController } from './modules/product/product.controller';

@Module({
  imports: [OrmModule, UserModule, ProductModule],
  controllers: [AppController, UserController, ProductController],
  providers: [AppService, Logger],
})
export class AppModule {}
