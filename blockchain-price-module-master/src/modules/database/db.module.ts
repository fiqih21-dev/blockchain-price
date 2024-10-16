import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Price } from 'src/modules/database/price.entity';
import { Alert } from 'src/modules/database/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Alert])],
  exports: [TypeOrmModule],
})
export class DbModule {}
