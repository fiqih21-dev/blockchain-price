import { Module } from '@nestjs/common';
import { RabbitmqService } from 'src/modules/core/rabbitmq/rabbitmq.service';

@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
