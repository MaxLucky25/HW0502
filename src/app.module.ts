import { configModule } from './configs/dynamic-config-module';
import { Module } from '@nestjs/common';
import { TestingModule } from './modules/testing/testing.module';
import { ContentModule } from './modules/content-manage/content.module';
import { AuthManageModule } from './modules/auth-manage/auth-manage.module';
import { ThrottlerConfigModule } from './configs/throttle-config.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    configModule,
    CoreModule,
    ThrottlerConfigModule,
    AuthManageModule,
    ContentModule,
    TestingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
