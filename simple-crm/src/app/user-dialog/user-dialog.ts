import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { map, startWith } from 'rxjs';
import { UserService } from '../user/user.service';

const PROGRESS_DURATION_MS = 1400;

@Component({
  selector: 'app-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressBarModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialog {
  private readonly dialogRef = inject(MatDialogRef<UserDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxBirthDate = new Date();
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly progressValue = signal(0);

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

  private readonly formValid = toSignal(
    this.form.statusChanges.pipe(
      startWith(this.form.status),
      map(() => this.form.valid),
    ),
    { initialValue: this.form.valid },
  );

  readonly showProgress = computed(() => this.formValid() || this.saving());

  cancel(): void {
    if (this.saving()) {
      return;
    }
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    if (this.saving()) {
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

    this.saving.set(true);
    this.saveError.set(null);
    this.progressValue.set(0);

    const progressDone = this.runProgressAnimation();

    try {
      await Promise.all([
        this.userService.addUser({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          birthDate: value.birthDate.toISOString().slice(0, 10),
          street: value.street,
          houseNumber: value.houseNumber,
          zipCode: value.zipCode,
          city: value.city,
        }),
        progressDone,
      ]);
      this.dialogRef.close(true);
    } catch (error: unknown) {
      await progressDone;
      const message =
        error instanceof Error
          ? error.message
          : 'Could not save the user. Please try again later.';
      this.saveError.set(message);
      console.error('Firestore save failed:', error);
      this.progressValue.set(0);
      this.saving.set(false);
    }
  }

  private runProgressAnimation(): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      let frameId = 0;
      let finished = false;

      const finish = () => {
        if (finished) {
          return;
        }
        finished = true;
        this.progressValue.set(100);
        resolve();
      };

      const tick = (now: number) => {
        const elapsed = now - start;
        const next = Math.min(100, (elapsed / PROGRESS_DURATION_MS) * 100);
        this.progressValue.set(next);

        if (next >= 100) {
          finish();
          return;
        }

        frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);

      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(frameId);
        finish();
      });
    });
  }
}
