import type {
  ClaimPreviewInput,
  ClaimProcessingResult,
} from '@papaya/contracts';
import { request } from '@/lib/api/client';

export const processClaim = (
  input: ClaimPreviewInput,
  mode: 'preview' | 'process',
) =>
  request<ClaimProcessingResult>(`/claims/${mode}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
