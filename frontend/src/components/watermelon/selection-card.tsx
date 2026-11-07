import React from "react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  aside?: React.ReactNode;
}

/**
 * Adapted from Watermelon UI's Radio Group 11: the radio dot is hidden and the whole
 * bordered card selects. Built on a native radio, so arrow keys work as usual.
 */
export function SelectionCard({ name, value, checked, disabled, onSelect, title, description, aside }: SelectionCardProps) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4 rounded-xl border bg-white p-4 transition-[border-color,box-shadow] duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-green",
        checked ? "border-brand-green shadow-[inset_0_0_0_1px_#2D4A33]" : "border-brand-border",
        disabled ? "cursor-not-allowed bg-transparent" : "cursor-pointer hover:border-[#D3CEC3]",
        checked && "hover:border-brand-green"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="min-w-0">
        <span className={cn("block text-[15px] font-medium leading-5", disabled ? "text-brand-muted" : "text-brand-dark")}>
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-[1.45] text-brand-muted">{description}</span>
      </span>
      {aside && <span className="shrink-0 text-[15px] font-medium tabular-nums text-brand-dark">{aside}</span>}
    </label>
  );
}
