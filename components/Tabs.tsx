'use client';

import { useRef, useState, KeyboardEvent, ReactNode, MutableRefObject } from 'react';

export type TabItem = { id: string; label: ReactNode };

type UseTabsResult = {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement>, idx: number) => void;
};

/**
 * Shared roving-tabindex state for a tablist: tracks the active tab, exposes
 * button refs for arrow-key focus moves, and handles ArrowLeft/ArrowRight/Home/End.
 */
export function useTabs(tabs: TabItem[], initial?: string): UseTabsResult {
  const [activeTab, setActiveTab] = useState<string>(initial ?? tabs[0]?.id ?? '');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusAndActivate(idx: number) {
    if (tabs.length === 0) return;
    const clamped = ((idx % tabs.length) + tabs.length) % tabs.length;
    tabRefs.current[clamped]?.focus();
    setActiveTab(tabs[clamped].id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusAndActivate(idx + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusAndActivate(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAndActivate(0);
        break;
      case 'End':
        e.preventDefault();
        focusAndActivate(tabs.length - 1);
        break;
    }
  }

  return { activeTab, setActiveTab, tabRefs, handleKeyDown };
}

type TabListProps = {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (id: string) => void;
  tabRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement>, idx: number) => void;
  /** Required: names the tablist for assistive tech (e.g. the entity's title). */
  ariaLabel: string;
  idPrefix: string;
  /** Wrap tabs onto multiple lines instead of horizontal scroll (ShlokaTypeTabs). */
  wrap?: boolean;
  /** Optional trailing content per tab, e.g. a count badge. */
  suffix?: (tab: TabItem) => ReactNode;
};

export function TabList({
  tabs, activeTab, onSelect, tabRefs, handleKeyDown, ariaLabel, idPrefix, wrap, suffix,
}: TabListProps) {
  return (
    <div style={{
      position: 'sticky',
      top: 'var(--nav-height)',
      zIndex: 10,
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      margin: '0 -24px 32px',
      padding: '0 24px',
    }}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        style={{
          display: 'flex',
          gap: 0,
          ...(wrap
            ? { flexWrap: 'wrap' as const }
            : { overflowX: 'auto' as const, scrollbarWidth: 'none' as const, WebkitOverflowScrolling: 'touch' as const }),
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`${idPrefix}-tab-${tab.id}`}
              ref={el => { tabRefs.current[idx] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onKeyDown={e => handleKeyDown(e, idx)}
              style={{
                flexShrink: 0,
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--color-gold)' : 'transparent'}`,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
                minHeight: '44px',
              }}
            >
              {tab.label}
              {suffix?.(tab)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TabPanelProps = {
  id: string;
  activeTab: string;
  idPrefix: string;
  children: ReactNode;
  className?: string;
};

/** Panels always render (with `hidden`) so inactive tab content stays in SSR HTML for SEO. */
export function TabPanel({ id, activeTab, idPrefix, children, className }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-tab-${id}`}
      tabIndex={0}
      hidden={activeTab !== id}
      className={className}
    >
      {children}
    </div>
  );
}
