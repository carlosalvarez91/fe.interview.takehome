interface StepDef {
  key: string;
  label: string;
}

interface Props {
  steps: StepDef[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.key} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
              <span className="flex items-center gap-2 shrink-0">
                <span
                  className={[
                    'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium shrink-0',
                    isCompleted ? 'bg-blue-600 text-white' : '',
                    isCurrent ? 'border-2 border-blue-600 text-blue-600 bg-white' : '',
                    !isCompleted && !isCurrent ? 'border-2 border-gray-300 text-gray-400 bg-white' : '',
                  ].join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={[
                    'text-sm font-medium hidden sm:inline',
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </span>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
