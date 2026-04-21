import { type RefObject } from 'react';
import type { Provider } from '../types';

interface Props {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  selectedProvider: Provider | null;
  onSelect: (provider: Provider) => void;
  onRetry: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}

export default function ProviderStep({
  providers,
  loading,
  error,
  selectedProvider,
  onSelect,
  onRetry,
  headingRef,
}: Props) {
  return (
    <section aria-labelledby="step-heading">
      <h2
        id="step-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold text-gray-900 mb-1 focus:outline-none"
      >
        Choose a Provider
      </h2>
      <p className="text-gray-500 mb-6">Select the venue or event provider for your company event.</p>

      {loading && (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Loading providers">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium text-sm">Failed to load providers</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-medium">No providers available</p>
          <p className="text-sm mt-1">Please check back later or contact support.</p>
        </div>
      )}

      {!loading && !error && providers.length > 0 && (
        <ul className="grid gap-3" role="list" aria-label="Available providers">
          {providers.map((provider) => {
            const isSelected = selectedProvider?.id === provider.id;
            return (
              <li key={provider.id}>
                <button
                  onClick={() => onSelect(provider)}
                  aria-pressed={isSelected}
                  className={[
                    'w-full text-left p-5 rounded-xl border-2 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-4">
                    {provider.logo_url ? (
                      <img
                        src={provider.logo_url}
                        alt=""
                        aria-hidden="true"
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <span className="text-xl font-bold text-gray-400">
                          {provider.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{provider.name}</p>
                      {provider.location ? (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                          <span aria-hidden="true">📍 </span>
                          {provider.location}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-0.5">Location not specified</p>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-blue-600 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
