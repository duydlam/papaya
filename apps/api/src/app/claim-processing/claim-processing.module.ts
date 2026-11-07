import { Module } from '@nestjs/common';
import { TenantModule } from '../tenants/tenant.module';
import { ClaimProcessingController } from './claim-processing.controller';
import { ClaimProcessingService } from './claim-processing.service';
import { MockNotificationService } from './mock-notification.service';

@Module({
  imports: [TenantModule],
  controllers: [ClaimProcessingController],
  providers: [ClaimProcessingService, MockNotificationService],
})
export class ClaimProcessingModule {}
