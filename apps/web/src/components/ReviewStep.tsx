import { type RefObject } from 'react';
import type { Plan, Estimate } from '../types';

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const CODE_LABELS: Record<string, string> = {
  seating_type: 'Seating Type',
  food_package: 'Food Package',
  date_flex_window_days: 'Date Flexibility',
  catering_license_tier: 'Catering License Tier',
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  seating_type: { open: 'Open seating', reserved: 'Reserved seating' },
  food_package: { none: 'No food', light: 'Light refreshments', full: 'Full catering' },
  date_flex_window_days: { '0': 'No flexibility', '7': '1-week window', '30': '1-month window' },
};

function formatCode(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function codeLabel(code: string): string {
  return CODE_LABELS[code] ?? formatCode(code);
}
function valueLabel(code: string, value: string): string {
  return VALUE_LABELS[code]?.[value] ?? formatCode(value);
}

interface Props {
  plan: Plan;
  estimate: Estimate;
  priceDrift: boolean;
  finaliseLoading: boolean;
  finaliseError: string | null;
  onFinalise: () => void;
  onBack: () => void;
  onDismissDrift: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}

export default function ReviewStep({
  plan,
  estimate,
  priceDrift,
  finaliseLoading,
  finaliseError,
  onFinalise,
  onBack,
  onDismissDrift,
  headingRef,
}: Props) {
  const { pricing, blocking_reasons, selections } = estimate;
  const needsApproval = plan.approval_type === 'manager_review';
  const canFinalise = blocking_reasons.length === 0;

  const optionEntries = Object.entries(selections).filter(
    ([key]) => key !== 'addons'
  ) as [string, string][];

  const selectedAddonIds = (selections.addons ?? []) as string[];
  const selectedAddons = plan.addons.filter((a) => selectedAddonIds.includes(a.id));

  return (
    <section aria-labelledby="step-heading">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 -ml-1"
          aria-label="Back to configuration"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h2
          id="step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold text-gray-900 focus:outline-none"
        >
          Review & Submit
        </h2>
      </div>
      <p className="text-gray-500 mb-6">Confirm your selections before finalising the booking.</p>

      {priceDrift && (
        <div
          role="alert"
          className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4"
        >
          <div>
            <p className="text-amber-800 font-medium text-sm">Pricing has been updated</p>
            <p className="text-amber-700 text-sm mt-0.5">
              The total below reflects current server pricing and may differ from a previous view.
            </p>
          </div>
          <button
            onClick={onDismissDrift}
            aria-label="Dismiss pricing update notice"
            className="text-amber-600 hover:text-amber-900 shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {needsApproval && (
        <div
          role="note"
          className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <p className="text-blue-800 font-medium text-sm">Manager approval required</p>
          <p className="text-blue-700 text-sm mt-0.5">
            This plan needs manager sign-off. Submitting will move it to a pending state until reviewed.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <p className="font-semibold text-gray-900">{plan.name}</p>
          {plan.description && (
            <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
          )}
        </div>

        {optionEntries.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Configuration
            </p>
            <dl className="space-y-2">
              {optionEntries.map(([code, val]) => (
                <div key={code} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{codeLabel(code)}</dt>
                  <dd className="font-medium text-gray-900">{valueLabel(code, val)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {selectedAddons.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Add-ons
            </p>
            <ul className="space-y-1.5">
              {selectedAddons.map((addon) => (
                <li key={addon.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{addon.name}</span>
                  <span className="font-medium text-gray-900">
                    {addon.price_cents === 0
                      ? 'Free'
                      : formatPrice(addon.price_cents, addon.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          className="px-5 py-4"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Pricing summary"
        >
          <dl className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">Base price</dt>
              <dd className="font-medium text-gray-900">
                {formatPrice(pricing.base, pricing.currency)}
              </dd>
            </div>
            {pricing.addons > 0 && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Add-ons</dt>
                <dd className="font-medium text-gray-900">
                  {formatPrice(pricing.addons, pricing.currency)}
                </dd>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="text-lg font-bold text-blue-600">
                {formatPrice(pricing.total, pricing.currency)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {blocking_reasons.length > 0 && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium text-sm mb-2">
            Cannot submit — please fix the following:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {blocking_reasons.map((reason, i) => (
              <li key={i} className="text-red-700 text-sm">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {finaliseError && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-medium">{finaliseError}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onFinalise}
          disabled={!canFinalise || finaliseLoading}
          aria-disabled={!canFinalise || finaliseLoading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 transition-colors"
        >
          {finaliseLoading ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              Submitting…
            </>
          ) : needsApproval ? (
            'Submit for approval'
          ) : (
            'Finalise booking'
          )}
        </button>
      </div>
    </section>
  );
}
