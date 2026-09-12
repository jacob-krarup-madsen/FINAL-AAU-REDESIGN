import { forwardRef, type HTMLAttributes, ElementType, KeyboardEvent, type ReactNode, memo, useState, useContext, useCallback, useMemo, type MouseEvent } from 'react';
import { type LucideIcon, Star, Info, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { IconCircle, Badge, ProgressBar } from './Misc';
import { Stack } from '@/components/Layout';
import { Text, Heading, Skeleton } from './Misc';
import useStore from '@/store';
import { ToastContext } from './Misc';

/**
 * Card Variants - Senior UI/UX Architect refinement.
 * Enforces strict AAU brand tokens, 150ms physics, and 8pt grid logic.
 */
interface CardVariantProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'brand' | 'ghost' | null;
  accent?: 'none' | 'left' | 'top' | null;
  interactive?: boolean | null;
}

function cardVariants({
  variant,
  accent,
  interactive,
}: CardVariantProps = {}): string {
  const resolvedVariant = variant !== undefined ? variant : 'default';
  const resolvedAccent = accent !== undefined ? accent : 'none';
  const resolvedInteractive = interactive !== undefined ? interactive : false;

  return cn(
    "group relative flex flex-col h-full transition-all duration-150 ease-[var(--transition-ease)]",
    "bg-bg-card border border-border/60 rounded-xl",
    "isolate overflow-hidden",
    resolvedVariant === 'default' && "shadow-sm hover:shadow-md",
    resolvedVariant === 'elevated' && "shadow-md hover:shadow-xl",
    resolvedVariant === 'outlined' && "bg-transparent border-2 border-border hover:border-primary",
    resolvedVariant === 'brand' && "bg-gradient-to-br from-primary to-[var(--aau-light-blue)] text-white border-none shadow-lg after:absolute after:inset-0 after:bg-white/5 after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-150",
    resolvedVariant === 'ghost' && "bg-transparent border-none shadow-none hover:bg-bg-highlight/50",
    resolvedAccent === 'left' && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:z-10",
    resolvedAccent === 'top' && "before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-primary before:z-10",
    resolvedInteractive === true && "cursor-pointer select-none focus-visible:outline-none focus-visible:shadow-focus hover:-translate-y-1 active:scale-[0.98]"
  );
}

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onKeyDown">,
    CardVariantProps {
  as?: ElementType;
  children: ReactNode;
}

/**
 * CardRoot - High-performance AAU UI container.
 */
const CardRoot = memo(forwardRef<HTMLDivElement, CardProps>(
  ({ variant, accent, interactive, children, className, as: Component = "div" as any, onClick, ...props }, ref) => {
    const isClickable = interactive || !!onClick;

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).click();
      }
    };

    return (
      <Component
        ref={ref}
        className={cn("card", cardVariants({ variant, accent, interactive: isClickable }), className)}
        onClick={onClick}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        tabIndex={isClickable ? 0 : undefined}
        role={isClickable ? "button" : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
));

CardRoot.displayName = "Card";

interface CardHeaderVariantProps {
  padding?: 'default' | 'compact' | 'none' | null;
}

function headerVariants({ padding }: CardHeaderVariantProps = {}): string {
  const resolvedPadding = padding !== undefined ? padding : 'default';
  return cn(
    "flex items-center justify-between gap-md border-b border-border/40 transition-colors duration-150",
    resolvedPadding === 'default' && "p-md lg:p-lg",
    resolvedPadding === 'compact' && "py-sm px-md",
    resolvedPadding === 'none' && "p-0"
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement>, CardHeaderVariantProps {}

const CardHeader = memo(({ children, className, padding, ...props }: CardHeaderProps) => (
  <header className={cn("card__header", headerVariants({ padding }), className)} {...props}>
    {children}
  </header>
));

interface CardBodyVariantProps {
  padding?: 'default' | 'compact' | 'none' | null;
}

function bodyVariants({ padding }: CardBodyVariantProps = {}): string {
  const resolvedPadding = padding !== undefined ? padding : 'default';
  return cn(
    "flex-1 min-w-0",
    resolvedPadding === 'default' && "p-md lg:p-lg",
    resolvedPadding === 'compact' && "py-sm px-md",
    resolvedPadding === 'none' && "p-0"
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement>, CardBodyVariantProps {}

const CardBody = memo(({ children, className, padding, ...props }: CardBodyProps) => (
  <section className={cn("card__body", bodyVariants({ padding }), className)} {...props}>
    {children}
  </section>
));

interface CardFooterVariantProps {
  padding?: 'default' | 'compact' | 'none' | null;
}

function footerVariants({ padding }: CardFooterVariantProps = {}): string {
  const resolvedPadding = padding !== undefined ? padding : 'default';
  return cn(
    "mt-auto flex items-center gap-xs border-t border-border/40",
    resolvedPadding === 'default' && "p-md lg:p-lg",
    resolvedPadding === 'compact' && "py-sm px-md",
    resolvedPadding === 'none' && "p-0"
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement>, CardFooterVariantProps {}

const CardFooter = memo(({ children, className, padding, ...props }: CardFooterProps) => (
  <footer className={cn("card__footer", footerVariants({ padding }), className)} {...props}>
    {children}
  </footer>
));

interface CardDecorationProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ElementType;
}

const CardDecoration = memo(({ icon: Icon, className, ...props }: CardDecorationProps) => (
  <div
    className={cn(
      "card__decoration absolute -right-lg -bottom-lg opacity-[0.03] rotate-12 pointer-events-none z-0",
      className
    )}
    {...props}
  >
    {Icon && <Icon size={160} strokeWidth={1} aria-hidden="true" />}
  </div>
));

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Decoration: CardDecoration,
});

// InfoCard
export interface InfoCardProps {
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  iconSize?: number
  title: string
  subtitle?: string
  description?: string
  action?: ReactNode
  direction?: 'row' | 'col'
  elevated?: boolean
  className?: string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  children?: ReactNode
  isStarred?: boolean
  onStarToggle?: () => void
  addFavoriteLabel?: string
  removeFavoriteLabel?: string
  helpText?: string
}

export const InfoCard = memo(function InfoCard({
  icon,
  iconBg,
  iconColor,
  iconSize = 48,
  title,
  subtitle,
  description,
  action,
  direction = 'row',
  elevated,
  className = '',
  onClick,
  children,
  isStarred = false,
  onStarToggle,
  addFavoriteLabel,
  removeFavoriteLabel,
  helpText,
}: InfoCardProps) {
  const t = useStore((state) => state.t)
  const lang = useStore((state) => state.lang)
  const toastCtx = useContext(ToastContext)
  const [showHelp, setShowHelp] = useState(false)

  const handleStarClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    const wasStarred = isStarred
    onStarToggle?.()
    if (toastCtx) {
      const msg = wasStarred
        ? (lang === 'da' ? 'Fjernet fra favoritter' : 'Removed from favorites')
        : (lang === 'da' ? 'Tilføjet til favoritter' : 'Added to favorites')
      toastCtx.success(msg, { duration: 2000 })
    }
  }, [onStarToggle, isStarred, toastCtx, lang])

  const handleHelpClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    setShowHelp(v => !v)
  }, [])

  const isClickable = !!onClick

  return (
    <Card
      variant={elevated ? 'elevated' : 'default'}
      className={cn(
        'info-card transition-all duration-300',
        isClickable && 'hover:shadow-md hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:shadow-focus focus-visible:border-primary',
        className
      )}
      onClick={onClick}
    >
      <Card.Body className="p-md md:p-lg h-full w-full flex flex-col relative">
            {onStarToggle && (
          <button
            type="button"
            onClick={handleStarClick}
            aria-label={isStarred
              ? (removeFavoriteLabel || t('remove_favorite'))
              : (addFavoriteLabel || t('add_favorite'))}
            title={isStarred
              ? (removeFavoriteLabel || t('remove_favorite'))
              : (addFavoriteLabel || t('add_favorite'))}
            className={cn(
              'absolute top-[var(--space-sm)] right-[var(--space-sm)] z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isStarred
                ? 'text-warning bg-[var(--aau-light-gold)]/20 hover:bg-[var(--aau-light-gold)]/30'
                : 'text-disabled hover:text-primary hover:bg-bg-hover'
            )}
          >
            <Star
              size={20}
              strokeWidth={2}
              fill={isStarred ? 'currentColor' : 'none'}
              className={isStarred ? 'drop-shadow-sm' : ''}
            />
          </button>
        )}
        <Stack direction={direction} gap={direction === 'row' ? 'lg' : 'md'} align="start" full>
          <IconCircle icon={icon} bg={iconBg} color={iconColor} size={iconSize} className="shrink-0" />

          <Stack gap="xs" className="flex-1 min-w-0 h-full flex flex-col pr-8">
            {subtitle && (
              <span className="text-[10px] font-black uppercase tracking-wider text-muted/80 leading-none mb-3xs">
                {subtitle}
              </span>
            )}
            <Stack direction="row" gap="xs" align="center" className="w-full">
              <Text weight="bold" size="lg" className="truncate leading-tight">{title}</Text>

              {helpText && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    'text-disabled hover:text-primary transition-colors',
                    showHelp && 'text-primary bg-bg-hover'
                  )}
                  onClick={handleHelpClick}
                  aria-label={lang === 'da' ? 'Hjælp' : 'Help'}
                  pill
                >
                  <Info size={16} strokeWidth={2.5} />
                </Button>
              )}
            </Stack>

            {showHelp && helpText && (
              <div className="overflow-hidden transition-all duration-150">
                <Text
                  size="xs"
                  className="italic font-medium leading-relaxed bg-bg-highlight p-sm rounded-md border border-primary/10 mt-xs"
                >
                  {helpText}
                </Text>
              </div>
            )}

            {description && (
              <Text size="sm" muted className="leading-relaxed line-clamp-2">
                {description}
              </Text>
            )}

            {children && <div className="mt-auto pt-xs w-full">{children}</div>}
          </Stack>

          {action && (
            <div className="shrink-0 self-center lg:self-start pt-xs lg:pt-0">
              {action}
            </div>
          )}
        </Stack>

        {isClickable && !action && (
          <div className="absolute bottom-sm right-sm opacity-40 group-hover:opacity-100 transition-opacity duration-150">
            <ExternalLink size={16} strokeWidth={2.5} className="text-muted group-hover:text-primary" />
            <span className="sr-only"> ({lang === 'da' ? 'åbner i et nyt vindue' : 'opens in a new window'})</span>
          </div>
        )}
      </Card.Body>
    </Card>
  )
})

InfoCard.displayName = 'InfoCard';

// TeaserCard
export interface TeaserCardProps {
  isLoading?: boolean
  variant?: 'vertical' | 'horizontal'
  image?: string
  badge?: ReactNode
  badgeColor?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  title?: ReactNode
  description?: string
  progress?: number
  progressColor?: string
  onClick?: (e: MouseEvent) => void
  onStarToggle?: (starred: boolean) => void
  action?: ReactNode
  isStarred?: boolean
  className?: string
  hasAction?: boolean
  hasProgress?: boolean
}

export const TeaserCard = memo(function TeaserCard({
  isLoading = false,
  variant = 'vertical',
  image,
  badge,
  badgeColor = 'default',
  title,
  description,
  progress,
  progressColor,
  onClick,
  onStarToggle,
  action,
  isStarred = false,
  className,
  hasAction = false,
  hasProgress = false,
}: TeaserCardProps) {
  const t = useStore((state) => state.t)
  const isHorizontal = variant === 'horizontal'
  const [imgError, setImgError] = useState(false)

  const progressData = useMemo(() => {
    if (progress === undefined || isLoading) return null
    const rounded = Math.round(Math.max(0, Math.min(100, progress)))
    return {
      value: rounded,
      label: rounded > 0 ? `${rounded}% ${t('completed_short')}` : null
    }
  }, [progress, t, isLoading])

  if (isLoading) {
    return (
      <TeaserCardSkeleton
        variant={variant}
        className={className}
        hasAction={hasAction || !!action}
        hasProgress={hasProgress || progress !== undefined}
      />
    )
  }

  return (
    <Card
      className={cn(
        'group cursor-pointer shadow-sm hover:shadow-xl hover:border-primary hover:-translate-y-1 focus-within:shadow-focus focus-within:border-primary',
        isHorizontal ? 'flex-row min-h-[180px]' : 'flex-col',
        className
      )}
      onClick={(e) => onClick?.(e)}
    >
      <Button
        variant="ghost"
        className="absolute inset-0 z-[1] w-full h-full p-0 rounded-none opacity-0 focus-visible:outline-none"
        aria-label={typeof title === 'string' ? title : 'View details'}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
      />

      {image && !imgError ? (
        <div
          className={cn(
            'relative shrink-0 overflow-hidden transition-transform duration-500 ease-[var(--transition-ease)] group-hover:scale-105',
            isHorizontal ? 'w-[130px] sm:w-[150px] h-full' : 'w-full aspect-video'
          )}
        >
          {badge && (
            <div className="absolute top-sm left-sm z-10">
              <Badge
                variant={badgeColor}
                className="shadow-xl backdrop-blur-md font-bold px-2 py-0.5 border-none"
              >
                {badge}
              </Badge>
            </div>
          )}
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : image && imgError ? (
        <div
          className={cn(
            'relative shrink-0 overflow-hidden',
            isHorizontal ? 'w-[130px] sm:w-[150px] h-full' : 'w-full aspect-video'
          )}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
            <BookOpen size={32} className="text-primary/30" />
          </div>
        </div>
      ) : null}

      <div className="relative z-[2] flex flex-col flex-1 p-md gap-xs min-w-0">
        <div className="flex items-start justify-between gap-md shrink-0">
          <div className="flex-1 min-w-0">
            {!image && badge && (
              <Badge variant={badgeColor} className="mb-xs font-bold">
                {badge}
              </Badge>
            )}
            <Heading
              level={3}
              className="m-0 text-[1.125rem] font-bold leading-tight text-main transition-colors group-hover:text-primary line-clamp-2"
            >
              {title}
            </Heading>
          </div>

          <Button
            size="icon-sm"
            variant="ghost"
            pill
            className={cn(
              'relative z-30 transition-all duration-300 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center p-0 rounded-full',
              isStarred ? 'bg-bg-highlight text-warning shadow-sm' : 'text-disabled hover:text-main'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onStarToggle?.(!isStarred)
            }}
            aria-label={isStarred ? t('remove_favorite') : t('add_favorite')}
            aria-pressed={isStarred}
          >
            <Star
              size={18}
              strokeWidth={2}
              fill={isStarred ? 'currentColor' : 'none'}
            />
          </Button>
        </div>

        {description && (
          <Text
            size="sm"
            className="line-clamp-2 leading-relaxed text-muted shrink-0"
          >
            {description}
          </Text>
        )}

        {progressData && (
          <div className="mt-auto pt-xs space-y-2xs">
            <ProgressBar
              value={progressData.value}
              color={progressColor || 'var(--color-primary)'}
              height={6}
              className="rounded-full"
            />
            {progressData.label && (
              <Text size="xs" weight="bold" className="text-muted flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                {progressData.label}
              </Text>
            )}
          </div>
        )}

        {action && (
          <div className="relative z-30 pt-md mt-auto">
            {action}
          </div>
        )}

        <div className="absolute bottom-md right-md opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[var(--transition-ease)] pointer-events-none">
          <ChevronRight size={20} strokeWidth={2.5} className="text-primary" />
        </div>
      </div>
    </Card>
  )
})

TeaserCard.displayName = 'TeaserCard';

function TeaserCardSkeleton({
  variant,
  className,
  hasAction = false,
  hasProgress = false,
}: {
  variant?: 'vertical' | 'horizontal' | null
  className?: string
  hasAction?: boolean
  hasProgress?: boolean
}) {
  const isHorizontal = variant === 'horizontal'
  return (
    <Card className={cn(
      isHorizontal ? 'flex-row min-h-[180px]' : 'flex-col',
      'pointer-events-none',
      className
    )}>
      <div className={cn(
        'relative shrink-0 overflow-hidden bg-bg-card',
        isHorizontal ? 'w-[130px] sm:w-[150px] h-full' : 'w-full aspect-video'
      )}>
        <Skeleton variant="rectangular" className="w-full h-full" />
      </div>
      <div className="flex flex-col flex-1 p-md gap-sm min-w-0">
        <div className="flex items-start justify-between gap-md">
          <div className="flex-1 space-y-xs min-w-0">
            <Skeleton variant="text" width="30%" height="0.75rem" />
            <Skeleton variant="text" width="85%" height="1.5rem" />
          </div>
          <Skeleton variant="circle" size={44} className="shrink-0" />
        </div>
        <div className="space-y-2xs">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="95%" />
        </div>
        {hasProgress && (
          <div className="mt-auto pt-md">
            <Skeleton variant="rectangular" height={8} className="w-full rounded-full" />
          </div>
        )}
        {hasAction && (
          <div className="mt-auto pt-md">
            <Skeleton variant="rectangular" height={40} className="w-full rounded-[var(--radius-md)]" />
          </div>
        )}
      </div>
    </Card>
  )
}

