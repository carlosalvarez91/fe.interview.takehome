export interface Provider {
  id: string;
  name: string;
  location: string | null;
  logo_url: string | null;
}

export interface OptionGroup {
  code: string;
  description?: string;
  required: boolean;
  values: string[];
}

export interface Addon {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
}

export interface Plan {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  base_price_cents: number;
  currency: string;
  approval_type: 'none' | 'manager_review';
  min_participants: number;
  lead_time_days: number;
  options: OptionGroup[];
  addons: Addon[];
}

export interface Pricing {
  base: number;
  addons: number;
  total: number;
  currency: string;
}

export interface Estimate {
  id: string;
  status: string;
  plan?: { id: string; name: string };
  selections: Record<string, string | string[]>;
  pricing: Pricing;
  blocking_reasons: string[];
}

export interface FinaliseResult {
  id: string;
  status: string;
}

export type Selections = {
  addons: string[];
  [key: string]: string | string[];
};

export type Step = 'provider' | 'plan' | 'configure' | 'review' | 'status';
