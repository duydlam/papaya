import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ClaimPreviewDto } from './claim-processing.dto';
import { ClaimProcessingService } from './claim-processing.service';
import { MockNotificationService } from './mock-notification.service';

@Controller('claims')
export class ClaimProcessingController {
  constructor(
    private readonly processing: ClaimProcessingService,
    private readonly notifications: MockNotificationService,
  ) {}

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  preview(@Body() input: ClaimPreviewDto) {
    return this.processing.evaluate(input);
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async process(@Body() input: ClaimPreviewDto) {
    const result = await this.processing.evaluate(input);
    const mockDeliveries = this.notifications.send(result);
    return { ...result, mockDeliveries };
  }
}
