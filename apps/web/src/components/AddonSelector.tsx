import type { Addon } from '../types';

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

interface Props {
  addons: Addon[];
  selectedAddonIds: string[];
  onToggle: (addonId: string) => void;
}

export default function AddonSelector({ addons, selectedAddonIds, onToggle }: Props) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-2">
        Add-ons <span className="text-gray-400 font-normal">(optional)</span>
      </p>
      <ul className="space-y-2" aria-label="Available add-ons">
        {addons.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.id);
          const id = `addon-${addon.id}`;

          return (
            <li key={addon.id}>
              <label
                htmlFor={id}
                className={[
                  'flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/20',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={id}
                    checked={isSelected}
                    onChange={() => onToggle(addon.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ml-4 ${
                    addon.price_cents === 0 ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  {formatPrice(addon.price_cents, addon.currency)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
