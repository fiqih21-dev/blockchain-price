import { Global, Module } from '@nestjs/common';
import { DbModule } from 'src/modules/database/db.module';
import { PushEmailService } from 'src/modules/common/push-email/push-email.service';

@Global()
@Module({
  imports: [DbModule],
  providers: [PushEmailService],
  exports: [PushEmailService],
})
export class CommonModule {}
