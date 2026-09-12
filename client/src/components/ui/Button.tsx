import { forwardRef, memo, type ButtonHTMLAttributes } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button Variants - Senior UI/UX Architect refinement.
 * Enforces strict AAU brand tokens, 150ms physics, and 8pt grid sizing.
 */
interface ButtonVariantProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | null;
  size?: 'xs' | 'sm' | 'md' | 'icon' | 'icon-sm' | 'icon-xs' | null;
  full?: boolean | null;
  pill?: boolean | null;
  uppercase?: boolean | null;
}

function buttonVariants({
  variant,
  size,
  full,
  pill,
  uppercase,
}: ButtonVariantProps = {}): string {
  const resolvedVariant = variant !== undefined ? variant : 'primary';
  const resolvedSize = size !== undefined ? size : 'md';
  const resolvedUppercase = uppercase !== undefined ? uppercase : false;

  return cn(
    "inline-flex items-center justify-center gap-[var(--space-xs)] relative overflow-visible select-none whitespace-nowrap",
    "font-black tracking-tighter transition-all duration-150 ease-[var(--transition-ease)] outline-none isolate",
    "focus-visible:shadow-focus focus-visible:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-150",
    resolvedVariant === 'primary' && "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:bg-accent hover:shadow-[var(--shadow-md)] hover:-translate-y-1",
    resolvedVariant === 'secondary' && "bg-bg-card text-primary dark:text-white border-2 border-primary hover:bg-primary hover:text-primary-foreground hover:-translate-y-1",
    resolvedVariant === 'ghost' && "bg-transparent text-primary dark:text-white hover:bg-primary/5",
    resolvedVariant === 'outline' && "bg-transparent border border-[var(--border-color)] text-main hover:bg-bg-highlight hover:border-primary hover:text-primary",
    resolvedVariant === 'danger' && "bg-[var(--aau-dark-pink)] text-white shadow-sm hover:bg-[var(--aau-dark-pink)]/90 hover:-translate-y-1",
    resolvedVariant === 'success' && "bg-[var(--aau-dark-green)] text-white shadow-sm hover:bg-[var(--aau-dark-green)]/90 hover:-translate-y-1",
    resolvedSize === 'xs' && "h-[30px] px-[var(--space-xs)] text-[11px] rounded-[var(--radius-xs)]",
    resolvedSize === 'sm' && "h-[34px] px-[var(--space-sm)] text-[13px] rounded-[var(--radius-sm)]",
    resolvedSize === 'md' && "h-[38px] px-[var(--space-md)] text-[14px] rounded-[var(--radius-md)]",
    resolvedSize === 'icon' && "size-[38px] p-0 rounded-[var(--radius-md)]",
    resolvedSize === 'icon-sm' && "size-[34px] p-0 rounded-[var(--radius-sm)]",
    resolvedSize === 'icon-xs' && "size-[30px] p-0 rounded-[var(--radius-xs)]",
    full === true && "w-full",
    pill === true && "rounded-[var(--radius-full)]",
    resolvedUppercase === true && "uppercase",
    resolvedUppercase === false && "normal-case"
  );
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
}

const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      full,
      pill,
      uppercase,
      icon: Icon,
      iconRight: IconRight,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={loading ? 'true' : undefined}
        className={cn(buttonVariants({ variant, size, full, pill, uppercase }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <>
            {Icon && <Icon className="transition-transform group-hover:scale-110" size={16} strokeWidth={2.5} aria-hidden="true" />}
            {children && <span className="relative z-10">{children}</span>}
            {IconRight && <IconRight className="transition-transform group-hover:translate-x-0.5" size={16} strokeWidth={2.5} aria-hidden="true" />}
          </>
        )}
      </button>
    );
  }
));

Button.displayName = "Button";

export { Button };
export default Button;
