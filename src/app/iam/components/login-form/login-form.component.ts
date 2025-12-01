import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgOptimizedImage } from '@angular/common';
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
    TranslatePipe,
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
      next: authResponse => {
        this.accountApiService.saveToken(authResponse.token);
        console.log('🔍 Auth Response:', authResponse);

        // Fetch full user details to get the role
        this.accountApiService.getAccountById(authResponse.id).subscribe({
          next: user => {
            console.log('🔍 User Details:', user);
            if (user.role === 'PSYCHOLOGIST') {
              this.router.navigate(['/provider/homeProvider']);
            } else if (user.role === 'PATIENT') {
              this.router.navigate(['/client/homeClient']);
            } else {
              this.snackBar.open('Rol desconocido: ' + user.role, 'Cerrar', { duration: 3000 });
            }
          },
          error: err => {
            console.error('Error fetching user details:', err);
            this.snackBar.open('Error al obtener datos del usuario.', 'Cerrar', { duration: 3000 });
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
