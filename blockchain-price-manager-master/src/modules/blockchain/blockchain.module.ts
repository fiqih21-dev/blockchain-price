import { Module } from '@nestjs/common';
import { BlockchainService } from 'src/modules/blockchain/blockchain.service';
import { BlockchainController } from 'src/modules/blockchain/blockchain.controller';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
