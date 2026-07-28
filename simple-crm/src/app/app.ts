import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDialog } from './user-dialog/user-dialog';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

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

    // Beim Neuladen keine Seiteninhalte anzeigen (z. B. /dashboard)
    void this.router.navigateByUrl('/');
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
    });
  }
}
