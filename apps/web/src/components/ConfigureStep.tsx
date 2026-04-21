import { type RefObject } from 'react';
import type { Plan, Selections } from '../types';
import OptionGroupField from './OptionGroupField';
import AddonSelector from './AddonSelector';

interface Props {
  plan: Plan;
  selections: Selections;
  updateLoading: boolean;
  updateError: string | null;
  onUpdateSelection: (code: string, value: string) => void;
  onToggleAddon: (addonId: string) => void;
  onNext: () => void;
  onBack: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}

function getMissingRequired(plan: Plan, selections: Selections): string[] {
  return plan.options
    .filter((g) => g.required && g.values.length > 1 && !selections[g.code])
    .map((g) => g.code);
}

export default function ConfigureStep({
  plan,
  selections,
  updateLoading,
  updateError,
  onUpdateSelection,
  onToggleAddon,
  onNext,
  onBack,
  headingRef,
}: Props) {
  const missingRequired = getMissingRequired(plan, selections);
  const canProceed = missingRequired.length === 0;
  const hasAnyConfig = plan.options.length > 0 || plan.addons.length > 0;
  const hasRequiredOptions = plan.options.some((o) => o.required && o.values.length > 1);

  return (
    <section aria-labelledby="step-heading">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 -ml-1"
          aria-label="Back to plan selection"
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
            Configure Your Package
          </h2>
          <p className="text-sm text-gray-400">{plan.name}</p>
        </div>
      </div>

      {hasRequiredOptions && (
        <p className="text-gray-500 mb-6 text-sm">
          Fields marked <span className="text-red-500 font-medium">*</span> are required.
        </p>
      )}

      <div className="space-y-6 mt-4">
        {!hasAnyConfig && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="font-medium">No configuration needed</p>
            <p className="text-sm mt-1">This plan has no options or add-ons. You're ready to review.</p>
          </div>
        )}

        {plan.options.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            {plan.options.map((group) => (
              <OptionGroupField
                key={group.code}
                group={group}
                selectedValue={
                  typeof selections[group.code] === 'string'
                    ? (selections[group.code] as string)
                    : undefined
                }
                onChange={(value) => onUpdateSelection(group.code, value)}
              />
            ))}
          </div>
        )}

        {plan.addons.length > 0 && (
          <AddonSelector
            addons={plan.addons}
            selectedAddonIds={selections.addons as string[]}
            onToggle={onToggleAddon}
          />
        )}
      </div>

      {updateError && (
        <div role="alert" className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm font-medium">{updateError}</p>
          <p className="text-red-600 text-sm mt-1">Please check your selections and try again.</p>
        </div>
      )}

      {!canProceed && missingRequired.length > 0 && (
        <p
          className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3"
          role="status"
        >
          Please select a value for all required fields to continue.
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed || updateLoading}
          aria-disabled={!canProceed || updateLoading}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 transition-colors"
        >
          {updateLoading ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              Updating…
            </>
          ) : (
            'Review & Submit →'
          )}
        </button>
      </div>
    </section>
  );
}
