import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('defaults to following the system preference', () => {
    const theme = TestBed.inject(ThemeService);
    expect(theme.preference()).toBe('system');
  });

  it('applies the resolved theme to the document element', () => {
    const theme = TestBed.inject(ThemeService);

    theme.set('dark');
    TestBed.tick();
    expect(document.documentElement.dataset['theme']).toBe('dark');

    theme.set('light');
    TestBed.tick();
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('toggles between light and dark', () => {
    const theme = TestBed.inject(ThemeService);

    theme.set('light');
    theme.toggle();
    expect(theme.isDark()).toBe(true);

    theme.toggle();
    expect(theme.isDark()).toBe(false);
  });

  it('persists the preference', () => {
    const theme = TestBed.inject(ThemeService);
    theme.set('dark');
    TestBed.tick();

    expect(localStorage.getItem('tangy.theme')).toBe('dark');
  });
});
