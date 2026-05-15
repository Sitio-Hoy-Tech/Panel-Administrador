import { Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isPending?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  isPending = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-surface/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 mt-0.5">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-black/20 px-6 py-4 flex items-center justify-end gap-3 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/10'
              }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
