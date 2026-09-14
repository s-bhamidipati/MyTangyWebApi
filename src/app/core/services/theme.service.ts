import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'tangy.theme';

/** Owns the light/dark preference and mirrors the resolved theme onto <html data-theme>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly systemPrefersDark = signal(false);

  readonly preference = signal<ThemePreference>(this.read());

  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preference();
    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return preference;
  });

  readonly isDark = computed(() => this.resolved() === 'dark');

  constructor() {
    const query = this.mediaQuery();
    if (query) {
      this.systemPrefersDark.set(query.matches);
      query.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));
    }

    effect(() => {
      const theme = this.resolved();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = theme;
      }
      this.write(this.preference());
    });
  }

  set(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }

  private mediaQuery(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  }

  private read(): ThemePreference {
    if (typeof localStorage === 'undefined') {
      return 'system';
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private write(preference: ThemePreference): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Private mode — the in-memory preference still applies for this session.
    }
  }
}
