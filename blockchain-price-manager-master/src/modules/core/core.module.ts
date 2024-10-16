import { Global, Module } from '@nestjs/common';
import { RabbitmqModule } from 'src/modules/core/rabbitmq/rabbitmq.module';

@Global()
@Module({
  imports: [RabbitmqModule],
  exports: [RabbitmqModule],
})
export class CoreModule {}
