"use client";

import { cn } from "@/lib/utils";
import { Input } from "./input";

const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "AED", symbol: "د.إ" },
  { code: "QAR", symbol: "ر.ق" },
  { code: "SAR", symbol: "ر.س" },
  { code: "INR", symbol: "₹" },
  { code: "OMR", symbol: "ر.ع." },
  { code: "BHD", symbol: "BD" },
  { code: "KWD", symbol: "د.ك" },
  { code: "CNY", symbol: "¥" },
  { code: "JPY", symbol: "¥" },
  { code: "SGD", symbol: "S$" },
  { code: "MYR", symbol: "RM" },
  { code: "THB", symbol: "฿" },
  { code: "PKR", symbol: "₨" },
  { code: "BDT", symbol: "৳" },
  { code: "LKR", symbol: "Rs" },
  { code: "ZAR", symbol: "R" },
  { code: "KES", symbol: "KSh" },
];

interface CurrencyInputProps {
  /** Amount value */
  amount: number | string;
  /** Currency code (e.g., "USD") */
  currency: string;
  /** Callback when amount changes */
  onAmountChange: (amount: number | string) => void;
  /** Callback when currency changes */
  onCurrencyChange: (currency: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Placeholder for amount (default: "0.00") */
  placeholder?: string;
  /** Additional className */
  className?: string;
}

/**
 * CurrencyInput — paired amount + currency selector.
 * Shows currency code prefix, formats with decimals.
 */
export function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  required,
  disabled,
  placeholder = "0.00",
  className,
}: CurrencyInputProps) {
  const symbol = COMMON_CURRENCIES.find((c) => c.code === currency)?.symbol || currency;

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-24 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        {COMMON_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-slate-400">
          {symbol}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="ps-10"
        />
      </div>
    </div>
  );
}
