import { Module } from '@nestjs/common';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import { DbModule } from 'src/modules/database/db.module';

@Module({
  imports: [DbModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
