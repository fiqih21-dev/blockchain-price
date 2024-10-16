import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandModule } from 'nestjs-command';
import { configFn } from 'src/config';
import { CoreModule } from 'src/modules/core/core.module';
import { CommonModule } from 'src/modules/common/common.module';
import { Alert } from 'src/modules/database/alert.entity';
import { Price } from 'src/modules/database/price.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: configFn().MYSQL_HOST,
      port: 3306,
      username: configFn().MYSQL_USERNAME,
      password: configFn().MYSQL_PASSWORD,
      database: configFn().MYSQL_DATABASE,
      entities: [Alert, Price],
      synchronize: true,
      logging: true,
    }),
    CoreModule,
    CommonModule,
    CommandModule,
  ],
})
export class AppModule {}
