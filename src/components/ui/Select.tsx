import type { SelectHTMLAttributes } from "react";
import { useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, hint, error, options, placeholder, id, className, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedBy = [hint ? `${selectId}-hint` : "", error ? `${selectId}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      {label ? (
        <label className="ui-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        className={["ui-select", className].filter(Boolean).join(" ")}
        id={selectId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="ui-help" id={`${selectId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ui-error" id={`${selectId}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
