import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AccountApiService, SignUpPayload, UserResource } from '../../services/accountApi.service';

import { TranslatePipe } from '@ngx-translate/core';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-register-form-provider',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatButton,
    MatLabel,
    RouterLink,
    TranslatePipe,
    MatCheckbox
  ],
  templateUrl: './register-form-provider.component.html',
  styleUrl: './register-form-provider.component.css'
})
export class RegisterFormProviderComponent {
  registerForm: FormGroup;
  isProvider: boolean = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private accountService: AccountApiService
  ) {
    this.registerForm = this.fb.group({
      numColegiado: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const payload: SignUpPayload = {
      ...this.registerForm.value,
      type: 'provider'
    };

    this.accountService.signUp(payload).subscribe({
      next: (user: UserResource) => {
        this.accountService.createProvider(payload.numColegiado, user.id).subscribe({
          next: () => {
            this.snackBar.open('Account created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            setTimeout(() => this.router.navigate(['/iam/login']), 1500);
          },
          error: () => {
            this.snackBar.open('User created but failed to link as provider', 'Close', { duration: 3000 });
          }
        });
      },
      error: () => {
        this.snackBar.open('Something went wrong. Try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
