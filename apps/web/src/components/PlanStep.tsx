import { type RefObject, useRef, useEffect, useState } from 'react';
import type { Plan, Provider, Selections } from '../types';

interface Props {
  provider: Provider;
  plans: Plan[];
  loading: boolean;
  error: string | null;
  selectedPlan: Plan | null;
  currentSelections: Selections;
  onSelectPlan: (plan: Plan) => void;
  onConfirmSwitchPlan: (plan: Plan) => void;
  onBack: () => void;
  onRetry: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function hasMeaningfulSelections(selections: Selections): boolean {
  const hasOptions = Object.keys(selections).some(
    (k) => k !== 'addons' && selections[k] !== undefined && selections[k] !== ''
  );
  return hasOptions || (selections.addons as string[]).length > 0;
}

export default function PlanStep({
  provider,
  plans,
  loading,
  error,
  selectedPlan,
  currentSelections,
  onSelectPlan,
  onConfirmSwitchPlan,
  onBack,
  onRetry,
  headingRef,
}: Props) {
  const [pendingSwitchPlan, setPendingSwitchPlan] = useState<Plan | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pendingSwitchPlan) {
      confirmBtnRef.current?.focus();
    }
  }, [pendingSwitchPlan]);

  function handlePlanClick(plan: Plan) {
    if (
      selectedPlan &&
      selectedPlan.id !== plan.id &&
      hasMeaningfulSelections(currentSelections)
    ) {
      setPendingSwitchPlan(plan);
    } else {
      onSelectPlan(plan);
    }
  }

  function handleConfirmSwitch() {
    if (pendingSwitchPlan) {
      onConfirmSwitchPlan(pendingSwitchPlan);
      setPendingSwitchPlan(null);
    }
  }

  return (
    <section aria-labelledby="step-heading">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 -ml-1"
          aria-label="Back to provider selection"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h2
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold text-gray-900 focus:outline-none"
          >
            Choose a Plan
          </h2>
          <p className="text-sm text-gray-400">{provider.name}</p>
        </div>
      </div>
      <p className="text-gray-500 mb-6">
        Plans show their base price, constraints, and available options upfront so you can compare before committing.
      </p>

      {loading && (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Loading plans">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium text-sm">Failed to load plans</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium">No plans available</p>
          <p className="text-sm mt-1">This provider has no plans. Try a different provider.</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            Back to providers
          </button>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <ul className="grid gap-3" role="list" aria-label="Available plans">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const needsApproval = plan.approval_type === 'manager_review';

            return (
              <li key={plan.id}>
                <button
                  onClick={() => handlePlanClick(plan)}
                  aria-pressed={isSelected}
                  className={[
                    'w-full text-left p-5 rounded-xl border-2 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        {needsApproval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Requires approval
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                        <span>
                          Min{' '}
                          <strong className="text-gray-700 font-medium">{plan.min_participants}</strong>{' '}
                          participants
                        </span>
                        <span>
                          <strong className="text-gray-700 font-medium">{plan.lead_time_days}</strong>-day
                          lead time
                        </span>
                        {plan.options.length > 0 && (
                          <span>
                            <strong className="text-gray-700 font-medium">{plan.options.length}</strong>{' '}
                            option{plan.options.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {plan.addons.length > 0 && (
                          <span>
                            <strong className="text-gray-700 font-medium">{plan.addons.length}</strong>{' '}
                            add-on{plan.addons.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(plan.base_price_cents, plan.currency)}
                      </span>
                      <span className="text-xs text-gray-400">base price</span>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-blue-600 mt-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pendingSwitchPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 id="dialog-title" className="text-lg font-semibold text-gray-900">
              Switch to {pendingSwitchPlan.name}?
            </h3>
            <p id="dialog-desc" className="text-gray-600 mt-2 text-sm">
              Compatible selections will be preserved. Choices that don't exist in the new plan will be cleared.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                ref={confirmBtnRef}
                onClick={handleConfirmSwitch}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Switch plan
              </button>
              <button
                ref={cancelBtnRef}
                onClick={() => setPendingSwitchPlan(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Keep current
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
