import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, combineLatest, concat, from, map, of, switchMap } from 'rxjs';
import { CrmUser, CrmUserRow } from '../user/crm-user';
import { UserService } from '../user/user.service';

type UserLoadState =
  | { status: 'loading' }
  | { status: 'ready'; user: CrmUserRow }
  | { status: 'missing' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-user-id',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-id.html',
  styleUrl: './user-id.scss',
})
export class UserId {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  readonly maxBirthDate = new Date();
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly closing = signal(false);
  private readonly reloadTick = signal(0);

  private readonly userId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null as string | null },
  );

  readonly state = toSignal(
    combineLatest([toObservable(this.userId), toObservable(this.reloadTick)]).pipe(
      switchMap(([id]) => {
        if (!id) {
          return of<UserLoadState>({ status: 'missing' });
        }
        return concat(
          of<UserLoadState>({ status: 'loading' }),
          from(this.userService.getUserById(id)).pipe(
            map((user): UserLoadState =>
              user ? { status: 'ready', user } : { status: 'missing' },
            ),
            catchError((error: unknown) =>
              of<UserLoadState>({
                status: 'error',
                message:
                  error instanceof Error
                    ? error.message
                    : 'Could not load this user.',
              }),
            ),
          ),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as UserLoadState },
  );

  readonly canEdit = computed(() => this.state().status === 'ready' && !this.saving());

  readonly form = this.fb.group({
    firstName: this.fb.nonNullable.control('', Validators.required),
    lastName: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    birthDate: this.fb.control<Date | null>(null, Validators.required),
    street: this.fb.nonNullable.control('', Validators.required),
    houseNumber: this.fb.nonNullable.control('', Validators.required),
    zipCode: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d{5}$/),
    ]),
    city: this.fb.nonNullable.control('', Validators.required),
  });

  displayName(user: CrmUserRow): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unnamed user';
  }

  startEdit(): void {
    const current = this.state();
    if (current.status !== 'ready' || this.saving()) {
      return;
    }

    this.patchForm(current.user);
    this.saveError.set(null);
    this.editing.set(true);
  }

  cancelEdit(): void {
    if (this.saving()) {
      return;
    }
    this.editing.set(false);
    this.saveError.set(null);
    this.form.reset();
  }

  async saveEdit(): Promise<void> {
    const current = this.state();
    if (current.status !== 'ready' || this.saving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.birthDate) {
      return;
    }

    const payload: CrmUser = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      birthDate: value.birthDate.toISOString().slice(0, 10),
      street: value.street,
      houseNumber: value.houseNumber,
      zipCode: value.zipCode,
      city: value.city,
    };

    this.saving.set(true);
    this.saveError.set(null);

    try {
      await this.userService.updateUser(current.user.id, payload);
      this.editing.set(false);
      this.reloadTick.update((n) => n + 1);
    } catch (error: unknown) {
      this.saveError.set(
        error instanceof Error ? error.message : 'Could not save changes.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  close(event?: Event): void {
    event?.stopPropagation();
    if (this.closing() || this.saving()) {
      return;
    }
    this.editing.set(false);
    this.saveError.set(null);
    this.closing.set(true);
    void this.router.navigate([{ outlets: { overlay: null } }]);
  }

  onBackdropClick(): void {
    if (this.editing() || this.saving()) {
      return;
    }
    this.close();
  }

  onCardClick(event: Event): void {
    event.stopPropagation();
  }

  private patchForm(user: CrmUserRow): void {
    this.form.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      birthDate: this.parseBirthDate(user.birthDate),
      street: user.street ?? '',
      houseNumber: user.houseNumber ?? '',
      zipCode: user.zipCode ?? '',
      city: user.city ?? '',
    });
  }

  private parseBirthDate(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
