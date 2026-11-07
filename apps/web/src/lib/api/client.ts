import type { ApiErrorResponse, ApiResponse } from '@papaya/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    const message = body?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(', ')
        : (message ?? `${response.status} ${response.statusText}`),
    );
  }

  if (response.status === 204) return undefined as T;
  return ((await response.json()) as ApiResponse<T>).data;
}
