import type { Provider, Plan, Estimate, FinaliseResult, Selections } from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  getProviders: () => request<{ items: Provider[] }>('/providers'),

  getPlans: (providerId: string) =>
    request<{ items: Plan[] }>(`/plans?provider_id=${encodeURIComponent(providerId)}`),

  getEstimate: () => request<Estimate>('/estimate'),

  updateEstimate: (planId: string, selections: Selections) =>
    request<Estimate>('/estimate', {
      method: 'PUT',
      body: JSON.stringify({ plan_id: planId, selections }),
    }),

  finaliseEstimate: () =>
    request<FinaliseResult>('/estimate/finalise', { method: 'POST' }),
};
