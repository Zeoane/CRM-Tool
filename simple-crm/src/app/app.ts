import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';
import { UserDialog } from './user-dialog/user-dialog';
import { CrmUserRow } from './user/crm-user';
import { UserService } from './user/user.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule,
    MatTableModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly displayedColumns = ['name', 'email', 'city'] as const;

  readonly users = toSignal(
    isPlatformBrowser(this.platformId) ? this.userService.getUsers() : of([] as CrmUserRow[]),
    { initialValue: [] as CrmUserRow[] },
  );

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIcon(
      'menu-icon',
      sanitizer.bypassSecurityTrustResourceUrl('img/menu-icon.svg'),
    );
    iconRegistry.addSvgIcon(
      'add-user',
      sanitizer.bypassSecurityTrustResourceUrl('img/add-user.svg'),
    );

    // On reload, clear routed page content (e.g. /dashboard)
    void this.router.navigateByUrl('/');
  }

  userName(user: CrmUserRow): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
  }

  onDrawerOpenedChange(opened: boolean): void {
    if (!opened) {
      void this.router.navigateByUrl('/');
    }
  }

  openUserDialog(): void {
    this.dialog.open(UserDialog, {
      width: '720px',
      maxWidth: '92vw',
      autoFocus: 'first-heading',
      panelClass: 'user-dialog-panel',
    });
  }
}
