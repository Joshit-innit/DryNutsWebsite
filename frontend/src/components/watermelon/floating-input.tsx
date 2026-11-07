import React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Sits at the right edge of the field, such as a show-password button. */
  trailing?: React.ReactNode;
}

/**
 * Adapted from Watermelon UI's Floating Input. The label floats from CSS state alone,
 * which also covers browser autofill and values restored by react-hook-form.
 */
export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { label, error, trailing, id, className, ...props },
  ref
) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            "peer h-14 w-full rounded-xl border bg-white px-3.5 pb-1.5 pt-5 text-[15px] text-brand-dark caret-brand-green outline-none transition-[border-color,box-shadow] duration-200",
            error
              ? "border-red-700 focus:shadow-[0_0_0_1px_#B91C1C]"
              : "border-brand-border hover:border-[#D3CEC3] focus:border-brand-green focus:shadow-[0_0_0_1px_#2D4A33]",
            trailing && "pr-12",
            className
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3.5 top-[18px] origin-left text-[15px] leading-5 text-brand-muted transition-transform duration-200 ease-luxury",
            "peer-focus:-translate-y-[9px] peer-focus:scale-[0.8] peer-[:not(:placeholder-shown)]:-translate-y-[9px] peer-[:not(:placeholder-shown)]:scale-[0.8] peer-autofill:-translate-y-[9px] peer-autofill:scale-[0.8]",
            error ? "text-red-700" : "peer-focus:text-brand-green"
          )}
        >
          {label}
        </label>
        {trailing && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
});
