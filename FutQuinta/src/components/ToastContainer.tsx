import type { Toast, ToastType } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

const accentBg: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-cyan-500',
};

const textColor: Record<ToastType, string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-cyan-400',
};

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-9999 flex flex-col gap-2 w-auto sm:w-80 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-stretch bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden pointer-events-auto toast-slide-in"
        >
          <div className={`w-1 shrink-0 ${accentBg[toast.type]}`} />
          <div className="flex items-center gap-3 px-4 py-3 flex-1">
            <p className={`flex-1 text-sm font-medium ${textColor[toast.type]}`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
