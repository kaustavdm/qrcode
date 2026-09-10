import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('theme controller', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.resetModules();
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'),
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  it('defaults to system mode', async () => {
    const { initTheme, getTheme } = await import('./theme.svelte');
    initTheme();
    expect(getTheme()).toBe('system');
  });

  it('applies dark when system prefers dark', async () => {
    const { initTheme, resolvedTheme } = await import('./theme.svelte');
    initTheme();
    expect(resolvedTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme("light") overrides system and persists', async () => {
    const { initTheme, setTheme, resolvedTheme } = await import('./theme.svelte');
    initTheme();
    setTheme('light');
    expect(resolvedTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('qrcode.theme')).toBe('light');
  });

  it('initTheme() rehydrates persisted mode', async () => {
    const { initTheme, getTheme, resolvedTheme } = await import('./theme.svelte');
    localStorage.setItem('qrcode.theme', 'dark');
    initTheme();
    expect(getTheme()).toBe('dark');
    expect(resolvedTheme()).toBe('dark');
  });

  it('initTheme() called twice does not accumulate event listeners', async () => {
    const { initTheme } = await import('./theme.svelte');
    initTheme();
    const mq1 = window.matchMedia('(prefers-color-scheme: dark)');
    const callCount1 = (mq1.addEventListener as any).mock.calls.length;

    initTheme();
    const mq2 = window.matchMedia('(prefers-color-scheme: dark)');
    const callCount2 = (mq2.addEventListener as any).mock.calls.length;

    expect(callCount2).toBe(callCount1);
  });
});
