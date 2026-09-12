import { createContext, useContext, useEffect, useRef, forwardRef, type ReactNode, type ComponentProps, memo, isValidElement, cloneElement, type ReactElement } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useDropdown } from '@/hooks';

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = memo(function Dialog({ children, open = false, onOpenChange }: DialogProps) {
  const handleOpenChange = (val: boolean) => {
    onOpenChange?.(val);
  };

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
});

export interface DialogTriggerProps extends ComponentProps<'div'> {
  children: ReactNode;
}

export const DialogTrigger = memo(function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) return children;

  return (
    <div 
      data-slot="dialog-trigger"
      className="inline-block"
      onClick={() => context.onOpenChange(true)}
      {...props}
    >
      {children}
    </div>
  );
});

export interface DialogCloseProps extends ComponentProps<'div'> {
  children?: ReactNode;
}

export const DialogClose = memo(function DialogClose({ children, ...props }: DialogCloseProps) {
  const context = useContext(DialogContext);
  if (!context) return null;

  return (
    <div 
      data-slot="dialog-close"
      onClick={() => context.onOpenChange(false)} 
      className="inline-block"
      {...props}
    >
      {children}
    </div>
  );
});

export interface DialogContentProps extends ComponentProps<'div'> {
  showCloseButton?: boolean;
}

export const DialogContent = memo(forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, ...props }, _ref) => {
    const context = useContext(DialogContext);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const open = context?.open ?? false;
    const onOpenChange = context?.onOpenChange;

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (open) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        if (dialog.open) {
          dialog.close();
        }
      }
    }, [open]);

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleClose = () => {
        if (open) {
          onOpenChange?.(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onOpenChange?.(false);
        }
      };

      dialog.addEventListener('close', handleClose);
      dialog.addEventListener('keydown', handleKeyDown);
      return () => {
        dialog.removeEventListener('close', handleClose);
        dialog.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <dialog
        ref={dialogRef}
        role="dialog"
        className="fixed z-[var(--z-dialog)] bg-transparent border-0 p-0 m-0 w-screen h-screen max-w-none max-h-none flex items-center justify-center backdrop:bg-primary/45 backdrop:backdrop-blur-[2px] outline-none"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            onOpenChange?.(false);
          }
        }}
      >
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div
            data-slot="dialog-content"
            className={cn(
              "pointer-events-auto relative flex flex-col w-[calc(100dvw-2rem)] sm:w-full max-w-[480px] min-w-[280px]",
              "rounded-[var(--radius-xl)] bg-bg-card p-[var(--space-md)] lg:p-[var(--space-lg)]",
              "border-2 border-[var(--border-color)]/60 shadow-[var(--shadow-xl)] outline-none max-h-[90dvh] overflow-y-auto",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
            {showCloseButton && (
              <button
                onClick={() => onOpenChange?.(false)}
                className="absolute top-[var(--space-sm)] right-[var(--space-sm)] z-10 flex items-center justify-center size-8 rounded-full bg-transparent hover:bg-primary/5 text-muted hover:text-primary transition-colors cursor-pointer outline-none focus-visible:shadow-focus"
              >
                <XIcon size={20} strokeWidth={2.5} />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
        </div>
      </dialog>
    );
  }
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = memo(({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-[var(--space-xs)] mb-[var(--space-md)]", className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

export interface DialogFooterProps extends ComponentProps<"div"> {
  showCloseButton?: boolean;
}

export const DialogFooter = memo(({
  className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) => {
  const context = useContext(DialogContext);
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-[var(--space-md)] lg:-mx-[var(--space-lg)] -mb-[var(--space-md)] lg:-mb-[var(--space-lg)] mt-[var(--space-md)] lg:mt-[var(--space-lg)]",
        "flex flex-col-reverse gap-[var(--space-sm)] sm:flex-row sm:justify-end items-center",
        "p-[var(--space-md)] lg:p-[var(--space-lg)] bg-bg-highlight/30 border-t border-[var(--border-color)]/20 w-full",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Button 
          variant="outline" 
          size="md" 
          onClick={() => context?.onOpenChange(false)}
        >
          Close
        </Button>
      )}
    </div>
  );
});
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = memo(forwardRef<HTMLHeadingElement, ComponentProps<'h2'>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      data-slot="dialog-title"
      className={cn(
        "font-black tracking-tight text-[1.5rem] leading-[1.1] text-main",
        className
      )}
      {...props}
    />
  )
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = memo(forwardRef<HTMLParagraphElement, ComponentProps<'p'>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="dialog-description"
      className={cn(
        "text-sm leading-relaxed text-muted mt-[var(--space-xs)]",
        className
      )}
      {...props}
    />
  )
));
DialogDescription.displayName = "DialogDescription";

// ── Dropdown Component ───────────────────────────────────────────────────────

interface DropdownContextValue {
  isOpen: boolean
  close: () => void
  menuRef: React.RefObject<HTMLDivElement | null>
  buttonRef: React.RefObject<HTMLButtonElement | null>
  handleMenuKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  handleTriggerKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  toggle: () => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdownContext() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown compound components must be used within <Dropdown>')
  return ctx
}

interface TriggerHandlers {
  ref: React.RefObject<HTMLButtonElement | null>
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  onClick: () => void
}

interface TriggerState {
  isOpen: boolean
}

type TriggerChild = ((handlers: TriggerHandlers, state: TriggerState) => ReactNode) | ReactElement

interface RootProps {
  children: ReactNode
  className?: string
}

function DropdownRoot({ children, className }: RootProps) {
  const dropdown = useDropdown()
  return (
    <DropdownContext.Provider value={dropdown}>
      <div ref={dropdown.dropdownRef} className={cn('relative inline-flex', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

interface TriggerProps {
  children: TriggerChild
  className?: string
}

function DropdownTrigger({ children }: TriggerProps) {
  const ctx = useDropdownContext()

  if (typeof children === 'function') {
    return children(
      {
        ref: ctx.buttonRef,
        onKeyDown: ctx.handleTriggerKeyDown,
        onClick: ctx.toggle,
      },
      { isOpen: ctx.isOpen }
    ) as ReactElement
  }

  if (isValidElement(children)) {
    return cloneElement(children, {
      ref: ctx.buttonRef,
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        (children as any).props.onKeyDown?.(e)
        ctx.handleTriggerKeyDown(e)
      },
      onClick: (e: React.MouseEvent) => {
        (children as any).props.onClick?.(e)
        ctx.toggle()
      },
      'aria-expanded': ctx.isOpen,
      'aria-haspopup': 'menu' as const,
    } as Partial<unknown>)
  }

  return children as ReactElement
}

interface MenuProps {
  children: ReactNode | ((helpers: { close: () => void }) => ReactNode)
  className?: string
}

function DropdownMenu({ children, className }: MenuProps) {
  const ctx = useDropdownContext()

  return (
    <>
      {ctx.isOpen && (
        <div
          ref={ctx.menuRef as any}
          onKeyDown={ctx.handleMenuKeyDown}
          className={cn(
            'absolute right-0 top-full z-50 mt-2',
            'rounded-[var(--radius-lg)] border border-border bg-bg-card shadow-xl',
            'outline-none transition-all duration-150 ease-[var(--transition-ease)]',
            className
          )}
          role="menu"
        >
          {typeof children === 'function' ? children({ close: ctx.close }) : children}
        </div>
      )}
    </>
  )
}

interface ItemProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

function DropdownItem({ children, onClick, className, disabled }: ItemProps) {
  const ctx = useDropdownContext()

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'flex w-full cursor-pointer items-center',
        'px-[var(--space-sm)] py-[var(--space-2xs)]',
        'rounded-[var(--radius-md)] transition-colors duration-150',
        'text-sm font-bold text-main',
        'hover:bg-bg-highlight hover:text-primary',
        'focus-visible:bg-bg-highlight focus-visible:outline-none focus-visible:shadow-focus',
        disabled && 'pointer-events-none opacity-40',
        className
      )}
      onClick={() => {
        onClick?.()
        ctx.close()
      }}
    >
      {children}
    </div>
  )
}

export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
})

