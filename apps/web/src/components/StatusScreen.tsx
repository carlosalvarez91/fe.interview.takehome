import { type RefObject } from 'react';

interface Props {
  status: string;
  planName: string;
  onStartOver: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}

export default function StatusScreen({ status, planName, onStartOver, headingRef }: Props) {
  const isPending = status === 'pending_approval';
  const isFinalised = status === 'finalised';

  return (
    <section
      className="text-center py-16 px-4"
      aria-labelledby="status-heading"
      aria-live="assertive"
    >
      {isFinalised && (
        <>
          <div
            className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5"
            aria-hidden="true"
          >
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            id="status-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold text-gray-900 mb-2 focus:outline-none"
          >
            Booking Confirmed
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Your event package for <strong className="text-gray-700">{planName}</strong> has been
            finalised. Get ready for a great event!
          </p>
        </>
      )}

      {isPending && (
        <>
          <div
            className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-5"
            aria-hidden="true"
          >
            <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2
            id="status-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold text-gray-900 mb-2 focus:outline-none"
          >
            Pending Approval
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Your booking for <strong className="text-gray-700">{planName}</strong> has been
            submitted and is awaiting manager approval. You'll be notified once reviewed.
          </p>
        </>
      )}

      {!isFinalised && !isPending && (
        <>
          <div
            className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5"
            aria-hidden="true"
          >
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <h2
            id="status-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold text-gray-900 mb-2 focus:outline-none"
          >
            Submitted
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Status: <strong>{status}</strong>
          </p>
        </>
      )}

      <button
        onClick={onStartOver}
        className="mt-8 text-sm font-medium text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        Start a new booking
      </button>
    </section>
  );
}
