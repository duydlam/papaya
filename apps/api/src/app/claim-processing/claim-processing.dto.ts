import { IsIn, IsInt, IsObject, IsUUID, Max, Min } from 'class-validator';
import { CLAIM_TYPES } from '@papaya/contracts';
import { IsDateOnly } from './date-only.decorator';

export class ClaimPreviewDto {
  @IsUUID()
  tenantId!: string;

  @IsIn(CLAIM_TYPES)
  claimType!: (typeof CLAIM_TYPES)[number];

  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amount!: number;

  @IsDateOnly()
  submittedDate!: string;

  @IsObject()
  customFieldValues!: Record<string, string | number | boolean>;
}
