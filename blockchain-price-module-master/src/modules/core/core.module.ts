import { Module } from '@nestjs/common';
import { RabbitmqModule } from 'src/modules/core/rabbitmq/rabbitmq.module';
import { WsClientModule } from 'src/modules/core/ws-client/ws-client.module';

@Module({
  imports: [RabbitmqModule, WsClientModule],
})
export class CoreModule {}
