import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreModule } from 'src/modules/core/core.module';
import { CommonModule } from 'src/modules/common/common.module';

import { BlockchainModule } from 'src/modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    CommonModule,

    BlockchainModule,
  ],
})
export class AppModule {}
