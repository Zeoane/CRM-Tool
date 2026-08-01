import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CrmUserRow } from '../user/crm-user';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [MatTableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly displayedColumns = ['name', 'email', 'city'] as const;

  readonly users = toSignal(
    isPlatformBrowser(this.platformId) ? this.userService.getUsers() : of([] as CrmUserRow[]),
    { initialValue: [] as CrmUserRow[] },
  );

  userName(user: CrmUserRow): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
  }

  openUser(user: CrmUserRow): void {
    if (!user.id) {
      return;
    }
    void this.router.navigate([{ outlets: { overlay: ['user', user.id] } }]);
  }
}
