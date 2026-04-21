import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Provider, Plan, Selections, Step, Estimate } from './types';
import { makeEmptySelections, autoSelectSingleValues, preserveCompatibleSelections } from './utils';
import StepIndicator from './components/StepIndicator';
import ProviderStep from './components/ProviderStep';
import PlanStep from './components/PlanStep';
import ConfigureStep from './components/ConfigureStep';
import ReviewStep from './components/ReviewStep';
import StatusScreen from './components/StatusScreen';

const WIZARD_STEPS: { key: Step; label: string }[] = [
  { key: 'provider', label: 'Provider' },
  { key: 'plan', label: 'Plan' },
  { key: 'configure', label: 'Configure' },
  { key: 'review', label: 'Review' },
];


export default function App() {
  const [step, setStep] = useState<Step>('provider');

  const [providers, setProviders] = useState<Provider[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selections, setSelections] = useState<Selections>(makeEmptySelections());
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);

  const [providersLoading, setProvidersLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [finaliseLoading, setFinaliseLoading] = useState(false);

  const [providersError, setProvidersError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [finaliseError, setFinaliseError] = useState<string | null>(null);

  const [priceDrift, setPriceDrift] = useState(false);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const { items } = await api.getProviders();
      setProviders(items);
    } catch (err) {
      setProvidersError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setProvidersLoading(false);
    }
  }

  async function loadPlans(providerId: string) {
    setPlansLoading(true);
    setPlansError(null);
    try {
      const { items } = await api.getPlans(providerId);
      setPlans(items);
    } catch (err) {
      setPlansError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  }

  function handleSelectProvider(provider: Provider) {
    setSelectedProvider(provider);
    setSelectedPlan(null);
    setSelections(makeEmptySelections());
    setEstimate(null);
    setPlansError(null);
    setStep('plan');
    loadPlans(provider.id);
  }

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan);
    setSelections(autoSelectSingleValues(plan));
    setEstimate(null);
    setUpdateError(null);
    setStep('configure');
  }

  function handleConfirmSwitchPlan(plan: Plan) {
    setSelectedPlan(plan);
    setSelections(preserveCompatibleSelections(plan, selections));
    setEstimate(null);
    setUpdateError(null);
    setStep('configure');
  }

  function handleUpdateSelection(code: string, value: string) {
    setSelections((prev) => ({ ...prev, [code]: value }));
  }

  function handleToggleAddon(addonId: string) {
    setSelections((prev) => {
      const addons = prev.addons as string[];
      const exists = addons.includes(addonId);
      return {
        ...prev,
        addons: exists ? addons.filter((id) => id !== addonId) : [...addons, addonId],
      };
    });
  }

  async function handleGoToReview() {
    if (!selectedPlan) return;
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const updated = await api.updateEstimate(selectedPlan.id, selections);
      if (estimate && estimate.pricing.total !== updated.pricing.total) {
        setPriceDrift(true);
      }
      setEstimate(updated);
      setStep('review');
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update estimate');
    } finally {
      setUpdateLoading(false);
    }
  }

  async function handleFinalise() {
    setFinaliseLoading(true);
    setFinaliseError(null);
    try {
      const result = await api.finaliseEstimate();
      setFinalStatus(result.status);
      setStep('status');
    } catch (err) {
      setFinaliseError(err instanceof Error ? err.message : 'Failed to finalise');
    } finally {
      setFinaliseLoading(false);
    }
  }

  function handleBack() {
    if (step === 'plan') setStep('provider');
    else if (step === 'configure') setStep('plan');
    else if (step === 'review') setStep('configure');
  }

  function handleStartOver() {
    setStep('provider');
    setSelectedProvider(null);
    setSelectedPlan(null);
    setSelections(makeEmptySelections());
    setEstimate(null);
    setFinalStatus(null);
    setFinaliseError(null);
    setUpdateError(null);
    setPriceDrift(false);
  }

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Event Package Builder</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {step !== 'status' && (
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStepIndex} />
        )}

        <div className="mt-8">
          {step === 'provider' && (
            <ProviderStep
              providers={providers}
              loading={providersLoading}
              error={providersError}
              selectedProvider={selectedProvider}
              onSelect={handleSelectProvider}
              onRetry={loadProviders}
              headingRef={stepHeadingRef}
            />
          )}

          {step === 'plan' && selectedProvider && (
            <PlanStep
              provider={selectedProvider}
              plans={plans}
              loading={plansLoading}
              error={plansError}
              selectedPlan={selectedPlan}
              currentSelections={selections}
              onSelectPlan={handleSelectPlan}
              onConfirmSwitchPlan={handleConfirmSwitchPlan}
              onBack={handleBack}
              onRetry={() => loadPlans(selectedProvider.id)}
              headingRef={stepHeadingRef}
            />
          )}

          {step === 'configure' && selectedPlan && (
            <ConfigureStep
              plan={selectedPlan}
              selections={selections}
              updateLoading={updateLoading}
              updateError={updateError}
              onUpdateSelection={handleUpdateSelection}
              onToggleAddon={handleToggleAddon}
              onNext={handleGoToReview}
              onBack={handleBack}
              headingRef={stepHeadingRef}
            />
          )}

          {step === 'review' && selectedPlan && estimate && (
            <ReviewStep
              plan={selectedPlan}
              estimate={estimate}
              priceDrift={priceDrift}
              finaliseLoading={finaliseLoading}
              finaliseError={finaliseError}
              onFinalise={handleFinalise}
              onBack={handleBack}
              onDismissDrift={() => setPriceDrift(false)}
              headingRef={stepHeadingRef}
            />
          )}

          {step === 'status' && (
            <StatusScreen
              status={finalStatus ?? 'finalised'}
              planName={selectedPlan?.name ?? ''}
              onStartOver={handleStartOver}
              headingRef={stepHeadingRef}
            />
          )}
        </div>
      </main>
    </div>
  );
}
