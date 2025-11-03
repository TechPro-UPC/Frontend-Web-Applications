import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgIf, NgOptimizedImage} from '@angular/common';
import { AccountApiService } from '../../services/accountApi.service';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-form',
  imports: [
    MatButton,
    MatFormFieldModule,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    TranslatePipe,
    NgOptimizedImage,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginForm: FormGroup;
  loginError = false;

  constructor(
    private fb: FormBuilder,
    private accountApiService: AccountApiService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.accountApiService.signIn({ email, password }).subscribe({
      next: user => {
        this.accountApiService.saveToken(user.token);
        const userId = user.id;

        // ① Intentamos provider
        this.accountApiService.isProvider(userId).subscribe({
          next: provider => {
            if (provider) {
              localStorage.setItem('providerId', provider.id.toString());
              this.router.navigate(['/provider/homeProvider']);
              return;
            }

            // ② No es provider → intentamos client
            this.accountApiService.getClient(userId).subscribe({
              next: client => {
                if (client) {
                  localStorage.setItem('clientId', client.id.toString());
                  this.router.navigate(['/client/homeClient']);
                } else {
                  this.snackBar.open('El usuario no está vinculado a un rol.', 'Cerrar', { duration: 3000 });
                }
              },
              error: err => {
                console.error('Error al verificar client:', err);
                this.snackBar.open('Error al verificar client.', 'Cerrar', { duration: 3000 });
              }
            });
          },
          error: err => {
            console.error('Error al verificar provider:', err);
            this.snackBar.open('Error al verificar provider.', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: () => {
        this.loginError = true;
        this.snackBar.open('Email o contraseña inválidos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

}
