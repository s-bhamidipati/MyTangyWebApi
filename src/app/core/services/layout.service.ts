import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/** Breakpoint state as signals so templates and layout logic stay declarative. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly observer = inject(BreakpointObserver);

  readonly isHandset = toSignal(
    this.observer.observe('(max-width: 767.98px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  readonly isTabletDown = toSignal(
    this.observer.observe('(max-width: 1023.98px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );

  readonly isPortrait = toSignal(
    this.observer.observe(Breakpoints.HandsetPortrait).pipe(map((r) => r.matches)),
    { initialValue: false },
  );
}
