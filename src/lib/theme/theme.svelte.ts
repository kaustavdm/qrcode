export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'qrcode.theme';
let mode: ThemeMode = 'system';
let initialized = false;

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function apply(): void {
  const resolved: 'light' | 'dark' =
    mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function initTheme(): void {
  const stored = localStorage.getItem(KEY) as ThemeMode | null;
  mode = stored ?? 'system';
  apply();
  if (initialized) return;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', () => {
    if (mode === 'system') apply();
  });
  initialized = true;
}

export function setTheme(next: ThemeMode): void {
  mode = next;
  if (next === 'system') localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, next);
  apply();
}

export function getTheme(): ThemeMode {
  return mode;
}

export function resolvedTheme(): 'light' | 'dark' {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode;
}
