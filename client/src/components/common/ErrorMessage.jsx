import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss, className = '' }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 ${className}`}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-rose-400 hover:text-rose-600" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
