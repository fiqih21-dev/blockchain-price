import { Module } from '@nestjs/common';
import { RabbitmqService } from 'src/modules/core/rabbitmq/rabbitmq.service';

import { BlockchainModule } from 'src/modules/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [RabbitmqService],
})
export class RabbitmqModule {}
