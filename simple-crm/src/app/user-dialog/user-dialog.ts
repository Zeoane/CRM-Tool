import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const passwordConfirm = group.get('passwordConfirm')?.value;
  return password && passwordConfirm && password !== passwordConfirm
    ? { passwordsMismatch: true }
    : null;
}

/** Mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl und Sonderzeichen */
function strongPassword(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }

  const valid =
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  return valid ? null : { strongPassword: true };
}

@Component({
  selector: 'app-user-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialog {
  private readonly dialogRef = inject(MatDialogRef<UserDialog>);
  private readonly fb = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly showPasswordConfirm = signal(false);
  readonly maxBirthDate = new Date();

  readonly form = this.fb.group(
    {
      firstName: this.fb.nonNullable.control('', Validators.required),
      lastName: this.fb.nonNullable.control('', Validators.required),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      birthDate: this.fb.control<Date | null>(null, Validators.required),
      password: this.fb.nonNullable.control('', [Validators.required, strongPassword]),
      passwordConfirm: this.fb.nonNullable.control('', Validators.required),
    },
    { validators: passwordsMatch },
  );

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { passwordConfirm, ...user } = this.form.getRawValue();
    this.dialogRef.close(user);
  }
}
