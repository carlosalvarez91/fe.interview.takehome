import type { Plan, Selections } from './types';

export function makeEmptySelections(): Selections {
  return { addons: [] };
}

export function autoSelectSingleValues(plan: Plan): Selections {
  const s: Selections = { addons: [] };
  for (const group of plan.options) {
    if (group.values.length === 1) {
      s[group.code] = group.values[0];
    }
  }
  return s;
}

export function preserveCompatibleSelections(plan: Plan, prev: Selections): Selections {
  const s: Selections = { addons: [] };
  for (const group of plan.options) {
    if (group.values.length === 1) {
      s[group.code] = group.values[0];
    } else {
      const prevValue = prev[group.code];
      if (typeof prevValue === 'string' && group.values.includes(prevValue)) {
        s[group.code] = prevValue;
      }
    }
  }
  const planAddonIds = new Set(plan.addons.map((a) => a.id));
  s.addons = (prev.addons as string[]).filter((id) => planAddonIds.has(id));
  return s;
}
