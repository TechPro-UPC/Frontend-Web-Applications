import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AccountApiService, SignUpPayload, UserResource } from '../../services/accountApi.service';

import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { NgOptimizedImage } from '@angular/common';

import { PatientApiService } from '../../../profile/services/patient-api.service';
import { Patient } from '../../../profile/models/patient.entity';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-register-form-client',
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
    MatSelectModule
  ],
  templateUrl: './register-form-client.component.html',
  styleUrl: './register-form-client.component.css'
})
export class RegisterFormClientComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private accountService: AccountApiService,
    private patientService: PatientApiService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      gender: ['', Validators.required]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    // 1. Simplificación del Auth: Solo email y password (y role)
    const payload: SignUpPayload = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: 'PATIENT'
    };

    this.accountService.signUp(payload).subscribe({
      next: (user: UserResource) => {
        // 2. Auto-login para obtener el token
        const signInPayload = {
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        };

        this.accountService.signIn(signInPayload).subscribe({
          next: (response) => {
            this.accountService.saveToken(response.token);

            // 3. Datos Estáticos para el perfil (Removed random generation to ensure consistency)

            const staticPatientData: Patient = {
              id: 0,
              firstName: this.registerForm.value.firstName,
              lastName: this.registerForm.value.lastName,
              dni: this.registerForm.value.dni,
              phone: this.registerForm.value.phone,
              gender: "MALE",
              userId: response.id
            } as any;

            // 4. Lógica de Creación de Perfil (Rol Paciente)
            console.error('FORCE UPDATE CHECK ' + new Date().toISOString());
            console.log('Sending Patient Payload (Form Data):', JSON.stringify(staticPatientData, null, 2));
            this.patientService.post(staticPatientData).subscribe({
              next: () => {
                this.snackBar.open('Account and Profile created successfully (Static Data)!', 'Close', {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
                setTimeout(() => this.router.navigate(['/iam/login']), 1500);
              },
              error: (e) => {
                console.error('Profile creation failed:', e);
                // Fallback: Redirect even if profile fails
                this.snackBar.open('Account created but Profile failed. Redirecting...', 'Close', { duration: 3000 });
                setTimeout(() => this.router.navigate(['/iam/login']), 3000);
              }
            });
          },
          error: (e) => {
            console.error('Auto-login failed:', e);
            this.snackBar.open('Account created, but could not log in automatically.', 'Close', { duration: 3000 });
            setTimeout(() => this.router.navigate(['/iam/login']), 1500);
          }
        });
      },
      error: () => {
        this.snackBar.open('Sign Up failed. Try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
