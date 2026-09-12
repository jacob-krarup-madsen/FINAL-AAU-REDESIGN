import React, { forwardRef, useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { Search, X, ArrowRight, Check, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Stack } from '@/components/Layout';
import { Text } from './Misc';
import { cn } from '@/lib/utils';

// ==========================================
// Input Component Definitions
// ==========================================

interface InputVariantProps {
  variant?: "outlined" | "filled" | "ghost" | null;
  size?: "sm" | "md" | "lg" | null;
  error?: boolean | null;
}

function inputVariants({
  variant,
  size,
  error,
}: InputVariantProps = {}): string {
  const resolvedVariant = variant !== undefined ? variant : 'outlined';
  const resolvedSize = size !== undefined ? size : 'md';
  const resolvedError = error !== undefined ? error : false;

  return cn(
    "w-full rounded-[var(--radius-md)] font-[var(--font-family-base)] leading-[1.5] border-[1.5px] transition-[border-color,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] text-main focus-visible:outline-none focus:shadow-focus focus-visible:shadow-focus disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 placeholder:text-disabled h-10",
    resolvedVariant === 'outlined' && "border-[var(--border-color)] bg-bg-card focus:border-primary",
    resolvedVariant === 'filled' && "border-transparent bg-bg-highlight/50 focus:bg-bg-card focus:border-primary",
    resolvedVariant === 'ghost' && "border-transparent bg-transparent focus:bg-bg-highlight/50",
    resolvedSize === 'sm' && "px-[var(--space-sm)] py-[var(--space-xs)] text-sm",
    resolvedSize === 'md' && "px-[var(--space-md)] py-[var(--space-sm)] text-base",
    resolvedSize === 'lg' && "px-[var(--space-lg)] py-[var(--space-md)] text-lg rounded-[var(--radius-lg)]",
    resolvedError === true && "border-danger focus:border-danger focus-visible:shadow-[0_0_0_4px_rgba(204,68,91,0.35)] focus-visible:outline-none"
  );
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    InputVariantProps {
  full?: boolean;
  errorMessageId?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "outlined",
      size = "md",
      type = "text",
      error,
      full,
      className,
      errorMessageId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const ariaDescribedBy = error ? errorMessageId ?? generatedId : undefined;

    return (
      <input
        ref={ref}
        type={type}
        id={props.id ?? generatedId}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          inputVariants({ variant, size, error }),
          full && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// ==========================================
// Textarea Component Definitions
// ==========================================

interface TextareaVariantProps {
  variant?: "outlined" | "filled" | "ghost" | null;
  size?: "sm" | "md" | "lg" | null;
}

function textareaVariants({
  variant,
  size,
}: TextareaVariantProps = {}): string {
  const resolvedVariant = variant !== undefined ? variant : 'outlined';
  const resolvedSize = size !== undefined ? size : 'md';

  return cn(
    "flex min-h-[44px] w-full rounded-[var(--radius-lg)] border-[1.5px] transition-[border-color,box-shadow,background] duration-150 text-main focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-500 placeholder:text-disabled",
    resolvedVariant === 'outlined' && "border-[var(--border-color)] bg-bg-card focus:border-primary",
    resolvedVariant === 'filled' && "border-transparent bg-bg-highlight/50 focus:bg-bg-card focus:border-primary",
    resolvedVariant === 'ghost' && "border-transparent bg-transparent focus:bg-bg-highlight/50",
    resolvedSize === 'sm' && "px-sm py-xs text-[0.8125rem]",
    resolvedSize === 'md' && "px-md py-sm text-sm",
    resolvedSize === 'lg' && "px-lg py-md text-base"
  );
}

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    TextareaVariantProps {
  resize?: "none" | "vertical" | "horizontal" | "both";
  error?: boolean;
  full?: boolean;
  errorMessageId?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    props,
    ref
  ) => {
    const {
      variant = "outlined",
      size = "md",
      rows = 3,
      resize = "vertical",
      error,
      full,
      className,
      errorMessageId,
      ...restProps
    } = props;
    const generatedId = useId();
    const ariaDescribedBy = error ? errorMessageId ?? generatedId : undefined;

    return (
      <textarea
        ref={ref}
        rows={rows}
        id={props.id ?? generatedId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          textareaVariants({ variant, size }),
          error && "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(204,68,91,0.35)]",
          resize === "none" && "resize-none",
          resize === "vertical" && "resize-y",
          resize === "horizontal" && "resize-x",
          resize === "both" && "resize",
          full && "w-full",
          className
        )}
        {...restProps}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// ==========================================
// Checkbox Component Definitions
// ==========================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className: _className, label, error, disabled, ...props }, ref) => {
    const id = useId();
    return (
      <label className="inline-flex items-center gap-[var(--space-sm)] cursor-pointer select-none text-sm font-medium text-main disabled:opacity-60 disabled:cursor-not-allowed">
        <input
          ref={ref}
          type="checkbox"
          id={props.id ?? id}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "flex items-center justify-center size-5 border-[1.5px] rounded-[var(--radius-sm)] border-[var(--border-color)] bg-bg-card transition duration-150 ease-[var(--transition-ease)]",
          "peer-focus-visible:shadow-focus peer-focus-visible:outline-none",
          "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white",
          "peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100",
          error && "border-danger peer-checked:bg-danger peer-checked:border-danger",
          disabled && "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
        )}>
          <Check className="opacity-0 scale-50 transition-all duration-150 pointer-events-none" size={14} strokeWidth={3} />
        </div>
        {label && <span className="text-main">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ==========================================
// Radio Component Definitions
// ==========================================

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className: _className, label, error, disabled, ...props }, ref) => {
    const id = useId();
    return (
      <label className="inline-flex items-center gap-[var(--space-sm)] cursor-pointer select-none text-sm font-medium text-main disabled:opacity-60 disabled:cursor-not-allowed">
        <input
          ref={ref}
          type="radio"
          id={props.id ?? id}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "flex items-center justify-center size-5 border-[1.5px] rounded-full border-[var(--border-color)] bg-bg-card transition duration-150 ease-[var(--transition-ease)]",
          "peer-focus-visible:shadow-focus peer-focus-visible:outline-none",
          "peer-checked:border-primary peer-checked:text-primary",
          "peer-checked:[&>div]:scale-100 peer-checked:[&>div]:opacity-100",
          error && "border-danger peer-checked:border-danger",
          disabled && "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
        )}>
          <div className="size-2.5 rounded-full bg-primary opacity-0 scale-50 transition-all duration-150 pointer-events-none" />
        </div>
        {label && <span className="text-main">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// ==========================================
// Select Component Definitions
// ==========================================

interface SelectVariantProps {
  variant?: 'outlined' | 'filled' | null;
  size?: 'sm' | 'md' | 'lg' | null;
  error?: boolean | null;
}

function selectVariants({
  variant,
  size,
  error,
}: SelectVariantProps = {}): string {
  const resolvedVariant = variant !== undefined ? variant : 'outlined';
  const resolvedSize = size !== undefined ? size : 'md';
  const resolvedError = error !== undefined ? error : false;

  return cn(
    "w-full appearance-none rounded-[var(--radius-lg)] border-[1.5px] transition-all duration-150 ease-[var(--transition-ease)] text-main focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 pr-10 font-medium h-10",
    resolvedVariant === 'outlined' && "border-[var(--border-color)] bg-bg-card focus:border-primary",
    resolvedVariant === 'filled' && "border-transparent bg-bg-highlight/50 focus:bg-bg-card focus:border-primary",
    resolvedSize === 'sm' && "px-[var(--space-sm)] py-[var(--space-xs)] text-xs",
    resolvedSize === 'md' && "px-[var(--space-md)] py-[var(--space-sm)] text-sm",
    resolvedSize === 'lg' && "px-[var(--space-lg)] py-[var(--space-md)] text-base",
    resolvedError === true && "border-danger focus:border-danger focus-visible:shadow-[0_0_0_4px_rgba(204,68,91,0.35)]"
  );
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
    SelectVariantProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, children, ...props }, ref) => {
    const id = useId();
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          id={props.id ?? id}
          className={cn(selectVariants({ variant, size, error }), className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-transform duration-150" 
          size={16} 
          strokeWidth={2.5} 
        />
      </div>
    );
  }
);

Select.displayName = 'Select';

// ==========================================
// SearchInput Component Definitions
// ==========================================

export interface SearchInputProps extends Omit<InputProps, "type" | "onChange"> {
  onChange?: (val: string) => void
  onClear?: () => void
  onSubmit?: (e: React.FormEvent) => void
  iconSize?: number
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      onSubmit,
      placeholder,
      iconSize,
      className,
      ...props
    },
    ref
  ) => {
    const finalPlaceholder = placeholder ?? "Search..."
    const finalIconSize = iconSize ?? 14
    const input = (
      <div className={cn("relative flex-1", className)}>
        <Search size={finalIconSize} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={finalPlaceholder}
          className="pl-10 h-9 min-h-0"
          {...props}
        />
        {onClear && value && (
          <Button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-main hover:bg-transparent"
          >
            <X size={14} strokeWidth={2} />
          </Button>
        )}
        {onSubmit && !onClear && (
          <Button
            type="submit"
            aria-label="Submit search"
            variant="primary"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:scale-105 active:scale-95 transition-all shadow-[var(--shadow-md)]"
          >
            <ArrowRight size={finalIconSize} strokeWidth={2} />
          </Button>
        )}
      </div>
    )

    if (onSubmit) {
      return <form onSubmit={(e) => { e.preventDefault(); onSubmit(e) }} className="w-full">{input}</form>
    }

    return input
  }
)

SearchInput.displayName = "SearchInput"

// ==========================================
// FormField Component Definitions
// ==========================================

export interface FormFieldProps {
  id?: string;
  label?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  children?: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  helpText,
  required,
  error,
  children,
  className = "",
}: FormFieldProps) {
  const helpId = id ? `${id}-help` : undefined;
  const errorId = id ? `${id}-error` : undefined;

  return (
    <Stack gap="sm" className={className}>
      {label ? (
        <Text
          tag="label"
          htmlFor={id}
          size="sm"
          weight="bold"
          className="m-0 cursor-pointer block"
        >
          {label}
          {required ? (
            <span className="text-danger ml-2xs" aria-hidden="true">
              *
            </span>
          ) : null}
        </Text>
      ) : null}

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{
            id?: string;
            "aria-invalid"?: boolean | "true" | "false";
            "aria-describedby"?: string;
            required?: boolean;
          }>, {
            id: child.props.id || id,
            "aria-invalid": error ? true : child.props["aria-invalid"],
            "aria-describedby": [
              helpText ? helpId : null,
              error ? errorId : null,
              child.props["aria-describedby"],
            ]
              .filter(Boolean)
              .join(" ") || undefined,
            required: required || child.props.required,
          });
        }
        return child;
      })}

      {helpText ? (
        <span id={helpId} className="text-xs text-muted m-0 leading-tight">
          {helpText}
        </span>
      ) : null}

      {error ? (
        <div
          id={errorId}
          className="text-xs m-0 text-danger leading-tight overflow-hidden transition-all duration-150"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </Stack>
  );
}
