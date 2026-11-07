import { Injectable, Logger } from '@nestjs/common';
import type { ClaimProcessingResult, MockDelivery } from '@papaya/contracts';

@Injectable()
export class MockNotificationService {
  private readonly logger = new Logger(MockNotificationService.name);

  send(result: ClaimProcessingResult): MockDelivery[] {
    return result.notifications.flatMap(({ event, channels, emailTemplate }) =>
      channels.map((channel) => {
        const payload = {
          tenantId: result.tenantId,
          event,
          channel,
          claimType: result.claimType,
          amount: result.amount,
          submittedDate: result.submittedDate,
          customFieldValues: result.customFieldValues,
          ...(channel === 'email' && emailTemplate ? { emailTemplate } : {}),
        };
        this.logger.log(JSON.stringify({ type: 'mock_notification', payload }));
        return { event, channel, status: 'mocked' as const, payload };
      }),
    );
  }
}
