import React from "react";
import type { Toast } from "./useToasts";
import { labelClass } from "./styles";

export const ToastStack: React.FC<{
  toasts: Toast[];
  onDismiss: (id: number) => void;
  className?: string;
}> = ({ toasts, onDismiss, className }) => (
  <div className={className ?? "pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2"}>
    {toasts.map((t) => {
      const toneStyle =
        t.tone === "success"
          ? "border-emerald-400/60 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
          : t.tone === "error"
          ? "border-red-400/60 text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.35)]"
          : "border-blue-bright/60 text-blue-bright shadow-[0_0_24px_rgba(0,212,255,0.35)]";
      const icon = t.tone === "success" ? "◆" : t.tone === "error" ? "✕" : "▸";
      return (
        <button
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex min-w-[280px] max-w-sm items-center gap-3 border bg-navy-blue/95 px-4 py-3 text-left text-sm backdrop-blur transition-transform hover:translate-x-[-2px] ${toneStyle}`}
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
            animation: "slideInToast 220ms ease-out",
          }}
        >
          <span className="text-base">{icon}</span>
          <span className="flex-1 leading-snug">{t.message}</span>
        </button>
      );
    })}
    <style>{`
      @keyframes slideInToast {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `}</style>
  </div>
);

export const SectionTitle: React.FC<{
  eyebrow?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}> = ({ eyebrow, children, right }) => (
  <div className="mb-4 flex items-end justify-between gap-4 border-b border-blue-accent/20 pb-3">
    <div>
      {eyebrow && (
        <p className="font-bayon text-xs uppercase tracking-[0.3em] text-blue-bright/70">
          {eyebrow}
        </p>
      )}
      <h2 className="font-zuume text-3xl font-bold uppercase tracking-wider text-white">
        {children}
      </h2>
    </div>
    {right}
  </div>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);
