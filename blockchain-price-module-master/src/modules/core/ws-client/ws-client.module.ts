import { Module } from '@nestjs/common';
import { WsClientService } from 'src/modules/core/ws-client/ws-client.service';
import { BlockchainModule } from 'src/modules/blockchain/blockchain.module';
import { DbModule } from 'src/modules/database/db.module';

@Module({
  imports: [BlockchainModule, DbModule],
  providers: [WsClientService],
  exports: [WsClientService],
})
export class WsClientModule {}
