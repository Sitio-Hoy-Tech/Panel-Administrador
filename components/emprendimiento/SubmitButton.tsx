"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function SubmitButton({ children, className }: { children: React.ReactNode, className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit"
      disabled={pending}
      className={clsx(
        "bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all flex justify-center items-center",
        pending && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {pending ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
