/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

import { render as rtlRender, fireEvent as rtlFireEvent, act as rtlAct, renderHook as rtlRenderHook, Screen as RTLScreen } from '@testing-library/react';
import { renderWithProviders as customRenderWithProviders } from './test/test-utils';

/* eslint-disable no-var */
declare global {
  interface ImportMeta {
    readonly vitest: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Screen extends RTLScreen {}

  var render: typeof rtlRender;
  var screen: Screen;
  var fireEvent: typeof rtlFireEvent;
  var act: typeof rtlAct;
  var renderHook: typeof rtlRenderHook;
  var renderWithProviders: typeof customRenderWithProviders;

  interface Window {
    render: typeof rtlRender;
    fireEvent: typeof rtlFireEvent;
    act: typeof rtlAct;
    renderHook: typeof rtlRenderHook;
    renderWithProviders: typeof customRenderWithProviders;
  }
}
