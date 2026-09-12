import React, { type KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Stack } from '@/components/Layout';
import { cn } from '@/lib/utils';

// ==========================================
// Tabs Component Definitions
// ==========================================

interface TabItem {
  id?: string
  key?: string
  label: string
  count?: number
}

export interface TabsProps {
  items: TabItem[]
  activeTab?: string
  onChange: (tabId: string | undefined) => void
  className?: string
}

export default function Tabs({ items, activeTab, onChange, className = '' }: TabsProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();

    const tabButtons = Array.from(e.currentTarget.children).filter(
      (el): el is HTMLButtonElement => el.getAttribute('role') === 'tab'
    );
    const activeIndex = tabButtons.findIndex(btn => btn.getAttribute('aria-selected') === 'true');
    
    if (activeIndex === -1) return;

    let nextIndex = activeIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % tabButtons.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    tabButtons[nextIndex].focus();
    const nextTabId = items[nextIndex].id || items[nextIndex].key;
    onChange(nextTabId);
  };

  return (
    <div 
      role="tablist" 
      onKeyDown={handleKeyDown} 
      className={cn('flex flex-nowrap overflow-x-auto no-scrollbar bg-bg-card border border-border/60 p-xs rounded-xl gap-xs w-fit max-w-full', className)}
    >
      {items.map((tab, i) => {
        const isActive = activeTab === (tab.id || tab.key)
        const tabId = tab.id || tab.key
        return (
          <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            aria-controls={tabId ? `panel-${tabId}` : undefined}
            id={tabId ? `tab-${tabId}` : undefined}
            key={tabId || tab.label || i}
            className={cn(
              "relative flex items-center px-md py-xs cursor-pointer transition-all duration-150 font-bold text-sm whitespace-nowrap outline-none focus-visible:outline-none focus-visible:shadow-focus rounded-lg",
              isActive 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-muted hover:text-main dark:text-white/60 dark:hover:text-white hover:bg-bg-hover'
            )}
            onClick={() => onChange(tabId)}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span 
                className={cn(
                  'ml-sm px-2xs py-0.5 rounded-[var(--radius-pill)] text-[10px] font-black tracking-tighter uppercase transition-colors',
                  isActive ? 'bg-white text-primary' : 'bg-muted dark:bg-white/10 text-muted'
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

// ==========================================
// SegmentedControl Component Definitions
// ==========================================

interface SegmentedControlOption {
  value: string | number;
  label?: string;
  icon?: LucideIcon;
  img?: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string | number;
  onChange: (val: string | number) => void;
  className?: string;
  containerClickRotates?: boolean;
}

export function SegmentedControl({ options, value, onChange, className = '', containerClickRotates = false }: SegmentedControlProps) {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const sliderWidth = 100 / options.length;

  const handleContainerClick = () => {
    if (containerClickRotates) {
      const nextIndex = (activeIndex + 1) % options.length;
      onChange(options[nextIndex].value);
    }
  };

  return (
    <div
      className={cn('segmented-control relative flex p-0.5 bg-bg-input border border-border rounded-[var(--radius-md)] h-[38px] w-full overflow-hidden my-xs', className)}
      onClick={handleContainerClick}
    >
      <div
        className="segmented-control__slider absolute top-0.5 bottom-0.5 left-0.5 bg-accent rounded-[calc(var(--radius-md)-2px)] transition-transform duration-150 z-1 shadow-[var(--shadow-sm)]"
        style={{
          width: `calc(${sliderWidth}% - 4px)`,
          transform: `translateX(calc(${activeIndex * 100}%))`,
        }}
      />
      {options.map((option) => {
        const OptionIcon = option.icon;
        return (
        <button
          key={String(option.value)}
          type="button"
          className={[
            'segmented-control__option relative flex-1 flex items-center justify-center gap-xs border-none bg-transparent cursor-pointer z-2 text-[0.85rem] font-medium transition-colors duration-150 px-xs active:scale-95 focus-visible:outline-none focus-visible:shadow-focus rounded-sm before:absolute before:top-1/2 before:left-1/2 before:min-h-[44px] before:min-w-[44px] before:w-full before:h-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[\'\']',
            value === option.value 
              ? 'segmented-control__option--active text-text-white' 
              : 'text-text-muted hover:text-text-main',
          ].filter(Boolean).join(' ')}
          onClick={(e) => {
            e.stopPropagation();
            onChange(option.value);
          }}
          title={option.label}
        >
          {OptionIcon && <OptionIcon size={16} strokeWidth={2} aria-hidden="true" />}
          {option.img && <img src={option.img} alt="" className="w-6 h-6 object-contain rounded-[var(--radius-sm)] shadow-xs transition-transform duration-150 hover:scale-110" />}
          {option.label && <span className="text-[0.85rem] leading-none">{option.label}</span>}
        </button>
        );
      })}
    </div>
  );
}

// ==========================================
// TabBar Component Definitions
// ==========================================

interface Tab {
  id: string
  label: string
  icon?: LucideIcon
}

export interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  secondaryAction?: React.ReactNode
}

export function TabBar({ tabs, activeTab, onChange, secondaryAction }: TabBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();

    const tabButtons = Array.from(e.currentTarget.children).filter(
      (el): el is HTMLButtonElement => el.tagName === 'BUTTON'
    );
    const activeIndex = tabButtons.findIndex(btn => btn.getAttribute('aria-selected') === 'true');
    
    if (activeIndex === -1) return;

    let nextIndex = activeIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % tabButtons.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + tabButtons.length) % tabButtons.length;
    }

    tabButtons[nextIndex].focus();
    onChange(tabs[nextIndex].id);
  };

  return (
    <Stack direction="row" justify="between" align="center" className="w-full">
      <div 
        role="tablist" 
        onKeyDown={handleKeyDown} 
        className="flex flex-row gap-none"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-testid={`tab-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`relative px-md py-sm text-sm font-bold transition-all flex items-center gap-xs outline-none focus-visible:outline-none focus-visible:shadow-focus rounded-sm before:absolute before:top-1/2 before:left-1/2 before:min-h-[44px] before:min-w-[44px] before:w-full before:h-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] ${
                isActive ? 'text-primary' : 'text-muted hover:text-main'
              }`}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(var(--color-primary-rgb),0.3)]" />
              )}
            </button>
          );
        })}
      </div>
      {secondaryAction}
    </Stack>
  )
}
