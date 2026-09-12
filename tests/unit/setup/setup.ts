import './globals';
import { vi } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => {
      const globalMock = (globalThis as any).mockNavigate
      if (globalMock) return globalMock
      return vi.fn()
    }
  }
})

import { render as rtlRender, screen as rtlScreen, fireEvent as rtlFireEvent, act as rtlAct, renderHook as rtlRenderHook, waitFor as rtlWaitFor } from '@testing-library/react';
import { renderWithProviders as rtlRenderWithProviders } from './test-utils';

(globalThis as any).render = rtlRender;
Object.defineProperty(globalThis, 'screen', { value: rtlScreen, writable: true, configurable: true });
(globalThis as any).fireEvent = rtlFireEvent;
(globalThis as any).act = rtlAct;
(globalThis as any).renderHook = rtlRenderHook;
(globalThis as any).renderWithProviders = rtlRenderWithProviders;
(globalThis as any).waitFor = rtlWaitFor;

Element.prototype.scrollIntoView = vi.fn()

// Mock native HTMLDialogElement methods that are unsupported in jsdom
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
}

import "@testing-library/jest-dom"
import { afterEach } from "vitest";
import useStore from '@/store';

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};

const initialStore = useStore.getInitialState();

afterEach(() => {
  useStore.setState(initialStore, true);
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
  vi.useRealTimers();
});


