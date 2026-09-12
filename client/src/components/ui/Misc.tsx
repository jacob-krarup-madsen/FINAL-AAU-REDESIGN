import { type ReactNode, type HTMLAttributes, forwardRef, memo, type SVGProps, createContext, useContext, useState, useCallback, useMemo, type KeyboardEvent, type MouseEvent, type ElementType, type CSSProperties } from 'react';
import { type LucideIcon, HelpCircle, CloudUpload, File, CheckSquare, Settings, Search, ChevronUp, ChevronDown, Calendar, UserCheck, MapPin, X } from 'lucide-react';
import { Stack } from '@/components/Layout';
import { cn } from '@/lib/utils';
import Button from './Button';

// ── EmptyState ───────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, message, description, action, className }: EmptyStateProps) {
  const displayMessage = message || description

  return (
    <div className={cn("flex flex-col items-center p-xl border-dashed rounded-[var(--radius-md)] bg-card", className)}>
      {Icon ? <Icon size={24} strokeWidth={2} className="text-muted mb-sm" aria-hidden="true" /> : null}
      <Heading level={4} className="mb-md font-semibold">{title}</Heading>
      {displayMessage ? <Text size="sm" className="text-main">{displayMessage}</Text> : null}
      <div className="mt-md">{action}</div>
    </div>
  )
}

// ── HighlightText ────────────────────────────────────────────────────────────

interface HighlightTextProps {
  text: string
  query: string
}

export function HighlightText({ text, query }: HighlightTextProps) {
  if (!query) return <>{text}</>
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong
            key={i}
            className="font-black text-primary dark:text-accent bg-primary/10 dark:bg-accent/20 px-0.5 rounded-[var(--radius-sm)]"
          >
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  )
}

// ── KeyValue ─────────────────────────────────────────────────────────────────

export interface KeyValueProps {
  label: string
  value: ReactNode
  divider?: boolean
  className?: string
}

export function KeyValue({ label, value, divider, className = '' }: KeyValueProps) {
  return (
    <div className={['flex justify-between items-center py-xs', divider ? 'border-b border-border pb-sm' : '', className].filter(Boolean).join(' ')}>
      <Text size="sm" className="m-0">{label}</Text>
      <Text size="sm" weight="bold" className="m-0">{value}</Text>
    </div>
  )
}

// ── SectionHeader ────────────────────────────────────────────────────────────

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  description?: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  actions?: ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, description, level = 2, actions, className = '' }: SectionHeaderProps) {
  const desc = description ?? subtitle
  return (
    <div className={cn('mb-lg', className)}>
      <Stack direction="row" align="center" justify="between">
        <Stack gap="2xs">
          <Heading level={level} className="m-0">{title}</Heading>
          {desc ? <Text size="sm" muted className="m-0 leading-normal">{desc}</Text> : null}
        </Stack>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </Stack>
    </div>
  )
}

// ── ProgressBar ──────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  value?: number
  color?: string
  height?: number
  showLabel?: boolean | string
  "aria-label"?: string
  className?: string
}

export function ProgressBar({
  value = 0,
  color,
  height = 6,
  showLabel,
  "aria-label": ariaLabel,
  className,
}: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100)

  return (
    <div
      className={cn("flex items-center gap-sm", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-label={ariaLabel}
    >
      <div
        className="w-full rounded-pill overflow-hidden"
        style={{ height, backgroundColor: 'var(--color-bg-placeholder)' }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${safeValue}%`,
            background: color || 'var(--color-primary)',
          }}
        />
      </div>
      {showLabel ? (
        <span className="text-xs">
          {showLabel === true ? `${safeValue}%` : showLabel}
        </span>
      ) : null}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────

interface BadgeVariantProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  pill?: boolean;
  interactive?: boolean;
}

function badgeVariants({ variant = 'default', pill = false, interactive = false }: BadgeVariantProps = {}) {
  const base = "inline-flex items-center justify-center px-[var(--space-xs)] h-[var(--space-md)] rounded-[var(--radius-sm)] text-[0.625rem] font-black uppercase tracking-[0.05em] leading-none border border-transparent whitespace-nowrap isolate transition-all duration-150 ease-[var(--transition-ease)]";
  
  const variants = {
    default: "bg-bg-highlight text-main border-[var(--border-color)]/60",
    primary: "bg-primary text-white shadow-sm",
    secondary: "bg-primary/10 text-primary dark:text-indigo-200",
    success: "bg-[var(--aau-dark-green)]/10 text-[var(--aau-dark-green)]",
    warning: "bg-[var(--aau-dark-orange)]/10 text-[var(--aau-dark-orange)]",
    danger: "bg-[var(--aau-dark-pink)]/10 text-[var(--aau-dark-pink)]",
    info: "bg-[var(--aau-light-blue)]/10 text-[var(--aau-light-blue)]",
    outline: "bg-transparent border-[var(--border-color)] text-muted",
  };

  return cn(
    base,
    variants[variant],
    pill && "rounded-[var(--radius-full)] px-[var(--space-sm)]",
    interactive && "cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95"
  );
}

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    BadgeVariantProps {}

export const Badge = memo(forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, pill, interactive, children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        className={cn("badge", badgeVariants({ variant, pill, interactive }), className)}
        {...props}
      >
        {children}
      </span>
    )
  }
))

Badge.displayName = "Badge"

// ── Icon ─────────────────────────────────────────────────────────────────────

const iconNameMap: Record<string, LucideIcon> = {
  'cloud-arrow-up': CloudUpload,
  'file': File,
  'square-check': CheckSquare,
  'gear': Settings,
  'magnifying-glass': Search,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  icon?: LucideIcon
  name?: string
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info' | 'muted'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  label?: string
  strokeWidth?: number
}

const sizeMap: Record<string, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

const variantColors: Record<string, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
  muted: 'text-muted',
}

export function Icon({
  icon: IconComponent,
  name,
  variant,
  size = 'md',
  label,
  className,
  style,
  ...props
}: IconProps) {
  const FinalIcon = IconComponent || (name ? iconNameMap[name] : undefined) || HelpCircle

  return (
    <FinalIcon
      size={sizeMap[size]}
      strokeWidth={2}
      className={cn(
        'inline-flex items-center justify-center leading-none transition-colors duration-150 shrink-0',
        variant ? variantColors[variant] : '',
        className
      )}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      style={style}
      {...props}
    />
  )
}

export interface IconCircleProps {
  icon: LucideIcon;
  bg?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function IconCircle({ icon: IconComponent, bg, color, size = 48, className }: IconCircleProps) {
  const px = size
  const iconSize = size * 0.5

  return (
    <Stack
      align="center"
      justify="center"
      className={cn("icon-circle shrink-0 rounded-[var(--radius-pill)] transition-colors", className)}
      style={{
        background: bg,
        color: color,
        width: `${px}px`,
        height: `${px}px`,
      }}
    >
      <IconComponent size={iconSize} strokeWidth={2} aria-hidden="true" />
    </Stack>
  )
}

// ── ModuleHeader ─────────────────────────────────────────────────────────────

export interface ModuleHeaderProps {
  image?: string
  code?: string
  title?: string
  professor?: string
  semester?: string
  campus?: string
}

export function ModuleHeader({
  image,
  code,
  title,
  professor,
  semester,
  campus,
}: ModuleHeaderProps) {
  return (
    <header className="relative p-md sm:p-md lg:p-6 rounded-2xl overflow-hidden bg-cover bg-center text-white shadow-[var(--shadow-xl)] group min-h-[120px] flex flex-col justify-end" style={{ backgroundImage: `url(${image})` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/95 via-[var(--color-primary)]/80 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      <div className="relative flex flex-col gap-xs">
        {code ? (
          <Badge className="w-fit font-black tracking-widest bg-white/20 backdrop-blur-md text-white border-none px-2xs py-0.5 text-[10px] uppercase">
            {code}
          </Badge>
        ) : null}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black m-0 tracking-tight leading-none drop-shadow-[var(--shadow-md)]">
          {title}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80 mt-[var(--space-2xs)]">
          {semester ? <span className="flex items-center gap-[var(--space-sm)]"><Calendar size={14} strokeWidth={2} className="text-white/60" /> {semester}</span> : null}
          {professor ? <span className="flex items-center gap-[var(--space-sm)]"><UserCheck size={14} strokeWidth={2} className="text-white/60" /> {professor}</span> : null}
          {campus ? <span className="flex items-center gap-[var(--space-sm)]"><MapPin size={14} strokeWidth={2} className="text-white/60" /> {campus}</span> : null}
        </div>
      </div>
    </header>
  )
}

// ── Avatar Component ─────────────────────────────────────────────────────────

export interface AvatarProps {
  src?: string
  name?: string
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number
  status?: 'online' | 'offline' | 'away' | 'busy'
  className?: string
  onClick?: () => void
}
const avatarSizeMap = {
  '2xs': 16,
  'xs': 24,
  'sm': 32,
  'md': 40,
  'lg': 48,
  'xl': 56,
  '2xl': 64,
}

const avatarStatusColorMap = {
  online: 'var(--color-success)',
  offline: 'var(--color-text-disabled)',
  away: 'var(--color-warning)',
  busy: 'var(--color-danger)',
}

export const Avatar = memo(function Avatar({
  src,
  name,
  size = 'md',
  status,
  className = '',
  onClick,
}: AvatarProps) {
  const px = useMemo(() => {
    if (typeof size === 'number') return size
    return avatarSizeMap[size] ?? avatarSizeMap.md
  }, [size])

  const initials = useMemo(() => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [name])

  const { statusSize, borderWidth } = useMemo(() => ({
    statusSize: px <= 24 ? 6 : px <= 40 ? 10 : 14,
    borderWidth: px <= 32 ? 2 : 3
  }), [px])

  return (
    <div
      role={onClick ? "button" : "img"}
      aria-label={name ?? 'Avatar'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      className={cn(
        "relative rounded-[var(--radius-full)] shrink-0 overflow-visible isolate transition-all duration-150 ease-[var(--transition-ease)]",
        onClick && "cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-95 hover:shadow-[var(--shadow-md)]",
        className
      )}
      style={{ width: px, height: px }}
      onClick={onClick}
    >
      <div className="w-full h-full rounded-[var(--radius-full)] overflow-hidden border border-[var(--border-color)]/40 bg-bg-highlight flex items-center justify-center">
        {src ? (
          <img
            src={src}
            alt={name ?? ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-main font-black tracking-tighter"
            style={{ fontSize: px * 0.4 }}
          >
            {initials}
          </div>
        )}
      </div>

      {status && (
        <div
          className="absolute bottom-0 right-0 rounded-[var(--radius-full)] bg-bg-card shadow-sm"
          style={{
            width: statusSize,
            height: statusSize,
            padding: borderWidth,
          }}
        >
          <div 
            className="w-full h-full rounded-[var(--radius-full)]"
            style={{ backgroundColor: avatarStatusColorMap[status] }}
          />
        </div>
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar';

// ── Toast Component ──────────────────────────────────────────────────────────

export interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}

export interface ToastOptions {
  variant?: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ToastContextType {
  addToast: (message: string, options?: ToastOptions) => number;
  removeToast: (id: number) => void;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  toasts: Toast[];
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

let toastId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = ++toastId;
    const { variant = 'success', duration = 4000 } = options;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => addToast(message, { ...options, variant: 'success' }), [addToast]);
  const error = useCallback((message: string, options?: ToastOptions) => addToast(message, { ...options, variant: 'error' }), [addToast]);
  const info = useCallback((message: string, options?: ToastOptions) => addToast(message, { ...options, variant: 'info' }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, toasts }}>
      {children}
      <Stack gap="xs" className="fixed bottom-md right-md md:bottom-lg md:right-lg left-md md:left-auto z-[var(--z-toast,6000)] w-[calc(100%-var(--space-md)*2)] md:w-auto">
        {toasts.map((toast) => {
          const bgMap = { success: 'var(--color-success)', error: 'var(--color-danger)', info: 'var(--color-primary)' };
          return (
            <Stack
              key={toast.id}
              direction="row"
              align="center"
              gap="sm"
              className="text-sm font-semibold text-white px-md py-sm rounded-[var(--radius-md)] shadow-[var(--shadow-md)] min-w-[280px] max-w-[420px] animate-slide-in"
              style={{
                background: bgMap[toast.variant] || 'var(--color-primary)',
              }}
            >
              <Text className="flex-1">{toast.message}</Text>
              <Button variant="ghost" icon={X} onClick={() => removeToast(toast.id)} aria-label="Close" />
            </Stack>
          );
        })}
      </Stack>
    </ToastContext.Provider>
  );
}

// ── MasterItem Component ─────────────────────────────────────────────────────

export interface MasterItemProps {
  leading?: LucideIcon | ReactNode
  leadingClassName?: string
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  unread?: boolean
  selected?: boolean
  loading?: boolean
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  className?: string
}

export const MasterItem = memo(function MasterItem({
  leading: Leading,
  leadingClassName = '',
  title,
  subtitle,
  meta,
  trailing,
  unread = false,
  selected = false,
  loading = false,
  onClick,
  className = '',
}: MasterItemProps) {
  const isClickable = !!onClick

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(e as unknown as MouseEvent<HTMLDivElement>)
    }
  }

  const renderLeading = () => {
    if (!Leading) return null
    const isLucideIcon = typeof Leading === 'function' || (typeof Leading === 'object' && Leading !== null && 'render' in Leading)
    if (isLucideIcon) {
      const IconComp = Leading as LucideIcon
      return (
        <div className={`shrink-0 flex items-center justify-center transition-all w-9 h-9 sm:w-11 sm:h-11 rounded-[var(--radius-sm)] ${leadingClassName}`}>
          <IconComp size={18} strokeWidth={2.5} />
        </div>
      )
    }
    return <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">{Leading}</div>
  }

  if (loading) {
    return (
      <Stack
        direction="row"
        align="center"
        gap="sm"
        role="status"
        aria-busy="true"
        className={cn('group p-sm border-b border-border/40', className)}
      >
        <Skeleton variant="rectangular" className="w-9 h-9 sm:w-11 sm:h-11 rounded-[var(--radius-sm)]" />
        <Stack gap="none" className="flex-1 min-w-0">
          <Skeleton variant="text" width="60%" />
          <div className="h-2" />
          <Skeleton variant="text" width="40%" />
        </Stack>
        {trailing && <Skeleton variant="rectangular" className="w-6 h-6 rounded-[var(--radius-sm)]" />}
      </Stack>
    )
  }

  return (
    <Stack
      direction="row"
      align="center"
      gap="sm"
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(`group p-sm border-b border-border/40 transition-all duration-150 relative bg-bg-card focus-visible:outline-none focus-visible:shadow-focus ${
        isClickable ? 'cursor-pointer hover:bg-bg-hover' : ''
      } ${unread ? 'is-unread font-semibold' : ''} ${
        selected ? 'is-selected bg-primary/5 dark:bg-primary/10 active bg-bg-highlight dark:bg-white/5' : ''
      }`, className)}
    >
      {selected && <div className="panel-active-indicator" />}

      {renderLeading()}

      <Stack gap="none" className="flex-1 min-w-0">
        <div className="line-clamp-2" title={typeof title === 'string' ? title : undefined}>{title}</div>
        {subtitle && <div className="truncate text-text-muted text-xs">{subtitle}</div>}
        {meta}
      </Stack>

      {trailing && <div className="shrink-0 flex items-center gap-sm">{trailing}</div>}
    </Stack>
  )
})

MasterItem.displayName = 'MasterItem';

// ── Accordion Component ──────────────────────────────────────────────────────

interface AccordionContextType {
  openValues: string[];
  toggleValue: (val: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AccordionWrapperProps {
  children?: ReactNode;
  className?: string;
  defaultValue?: string[];
}

export const AccordionWrapper = memo(function AccordionWrapper({
  children,
  className,
  defaultValue = [],
}: AccordionWrapperProps) {
  const [openValues, setOpenValues] = useState<string[]>(defaultValue);

  const toggleValue = (val: string) => {
    setOpenValues((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <AccordionContext.Provider value={{ openValues, toggleValue }}>
      <div className={cn("space-y-sm", className)}>{children}</div>
    </AccordionContext.Provider>
  );
});

AccordionWrapper.displayName = 'AccordionWrapper';

export interface AccordionItemRowProps {
  value: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const AccordionItemRow = memo(function AccordionItemRow({
  value,
  title,
  children,
  className,
}: AccordionItemRowProps) {
  const context = useContext(AccordionContext);
  
  const [localOpen, setLocalOpen] = useState(false);
  
  const isOpen = context ? context.openValues.includes(value) : localOpen;
  
  const handleToggle = () => {
    if (context) {
      context.toggleValue(value);
    } else {
      setLocalOpen(!localOpen);
    }
  };

  return (
    <details
      open={isOpen}
      className={cn(
        "border border-[var(--border-color)]/60 rounded-[var(--radius-lg)] bg-bg-card overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-150 px-md w-full",
        className
      )}
    >
      <summary
        onClick={(e) => {
          e.preventDefault();
          handleToggle();
        }}
        className={cn(
          "flex flex-1 items-center justify-between py-md px-sm min-h-[48px] list-none cursor-pointer select-none",
          "text-main font-bold text-sm leading-tight transition-all duration-150",
          "hover:bg-bg-hover hover:text-primary dark:hover:text-white group outline-none rounded-[var(--radius-sm)] focus-visible:shadow-focus"
        )}
      >
        <span className="text-left font-semibold text-main">{title}</span>
        <ChevronDown
          size={20}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-muted group-hover:text-primary transition-transform duration-200 ease-[var(--transition-ease)]",
            isOpen && "rotate-180"
          )}
        />
      </summary>
      {isOpen && (
        <div className="overflow-hidden text-sm text-muted leading-relaxed pb-lg pt-sm px-sm border-t border-[var(--border-color)]/20">
          {children}
        </div>
      )}
    </details>
  );
});

AccordionItemRow.displayName = 'AccordionItemRow';

// ── Skeleton Components ──────────────────────────────────────────────────────

interface SkeletonProps {
  variant?: "text" | "circle" | "rectangular"
  width?: string | number
  height?: string | number
  size?: string | number
  className?: string
}

export function Skeleton({ variant = "text", width, height, size, className }: SkeletonProps) {
  if (variant === "circle") {
    const dim = size ?? 40
    return (
      <div
        className={cn("animate-pulse rounded-[var(--radius-pill)] bg-bg-highlight/60", className)}
        style={{ width: dim, height: dim }}
        aria-hidden="true"
      />
    )
  }

  if (variant === "rectangular") {
    return (
      <div
        className={cn("animate-pulse rounded-[var(--radius-md)] bg-bg-highlight/60", className)}
        style={{ width, height }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-bg-highlight/60", className)}
      style={{ width: width ?? "100%", height: height ?? 'var(--space-md)' }}
      aria-hidden="true"
    />
  )
}

export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="animate-fade-in">
      <div className="container pb-[var(--space-2xl)]">
        <div className="px-lg sm:px-2xl">
          <Skeleton variant="rectangular" width={180} height={28} className="mb-sm" />
          <Skeleton variant="text" width={300} height={16} className="mb-lg" />
        </div>
        <div className="px-lg sm:px-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[var(--radius-md)] p-md bg-muted/10">
                <Skeleton variant="rectangular" width="60%" height={20} className="mb-sm" />
                <Skeleton variant="text" width="100%" className="mb-xs" />
                <Skeleton variant="text" width="80%" className="mb-xs" />
                <Skeleton variant="text" width="45%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Typography Components ────────────────────────────────────────────────────

const typoWeightMap: Record<string, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

const typoSizeMap: Record<string, string> = {
  '2xs': '0.625rem',
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.1rem',
  xl: '1.4rem',
  '2xl': '1.6rem',
}

interface HeadingVariantProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6 | '1' | '2' | '3' | '4' | '5' | '6' | null;
  truncate?: boolean | null;
}

function headingVariants({
  level,
  truncate,
}: HeadingVariantProps = {}): string {
  const resolvedLevel = level !== undefined ? String(level) : '1';
  return cn(
    'm-0 font-bold tracking-tight leading-[1.2] text-main transition-colors',
    resolvedLevel === '1' && 'text-4xl md:text-5xl',
    resolvedLevel === '2' && 'text-3xl md:text-4xl',
    resolvedLevel === '3' && 'text-2xl md:text-[1.75rem]',
    resolvedLevel === '4' && 'text-xl md:text-2xl',
    resolvedLevel === '5' && 'text-lg md:text-xl',
    resolvedLevel === '6' && 'text-base md:text-lg',
    truncate === true && 'truncate'
  );
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, HeadingVariantProps {
  weight?: string | number
  as?: ElementType
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, weight, truncate, as, style, ...props }, ref) => {
    const Tag = as || (`h${level}` as ElementType)
    const resolvedStyle: CSSProperties = { ...style }
    
    if (weight) {
      resolvedStyle.fontWeight = typoWeightMap[weight as string] || weight
    }

    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ level, truncate }), className)}
        style={resolvedStyle}
        {...props}
      />
    )
  }
)

Heading.displayName = 'Heading'

function textVariants({
  size,
  muted,
}: {
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null;
  muted?: boolean | null;
} = {}): string {
  const resolvedSize = size !== undefined ? size : 'md';
  return cn(
    'm-0 leading-[1.6] text-main transition-colors',
    resolvedSize === '2xs' && 'text-[0.625rem]',
    resolvedSize === 'xs' && 'text-xs',
    resolvedSize === 'sm' && 'text-sm',
    resolvedSize === 'md' && 'text-base',
    resolvedSize === 'lg' && 'text-lg',
    resolvedSize === 'xl' && 'text-xl',
    resolvedSize === '2xl' && 'text-2xl',
    muted === true && 'text-muted'
  );
}

interface TextProps 
  extends Omit<React.HTMLAttributes<HTMLElement>, 'size'> {
  bold?: boolean
  tag?: ElementType
  weight?: string | number
  htmlFor?: string
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string | null
  muted?: boolean | null
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, size = 'md', weight, bold, muted, tag: Tag = 'p' as ElementType, style, ...props }, ref) => {
    const resolvedWeight = weight || (bold ? 'bold' : null)
    const resolvedStyle: CSSProperties = { ...style }

    if (resolvedWeight) {
      resolvedStyle.fontWeight = typoWeightMap[resolvedWeight as string] || resolvedWeight
    }

    type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    const isStandardSize = (s: string): s is TextSize => s in typoSizeMap
    const standardSize = size && isStandardSize(size) ? size : undefined
    
    if (size && !isStandardSize(size)) {
        resolvedStyle.fontSize = size
    }

    return (
      <Tag
        ref={ref}
        className={cn(textVariants({ size: standardSize, muted }), className)}
        style={resolvedStyle}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

type CaptionProps = React.HTMLAttributes<HTMLSpanElement>

export const Caption = forwardRef<HTMLSpanElement, CaptionProps>(
  ({ className, style, ...props }, ref) => (
    <Text
      ref={ref}
      tag="span"
      size="xs"
      muted
      className={cn('italic font-medium', className)}
      style={style}
      {...props}
    />
  )
)

Caption.displayName = 'Caption'

