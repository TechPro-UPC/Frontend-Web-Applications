import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AccountApiService, SignUpPayload, UserResource } from '../../services/accountApi.service';

import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgIf } from '@angular/common';

// Modales legales
import { TermsandconditionsModalComponent } from '../termsandconditions-modal/termsandconditions-modal.component';
import { PrivacyPolicyModalComponent } from '../privacypolicy-modal/privacypolicy-modal.component';
import { CodeModalComponent } from '../code-modal/code-modal.component';

import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';
import { Psychologist } from '../../../profile/models/psychologist.entity';
import { MatSelectModule } from '@angular/material/select';

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
    MatCheckbox,
    MatDialogModule,
    RouterLink,
    TranslatePipe,
    NgIf,
    MatSelectModule
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
    private accountService: AccountApiService,
    private dialog: MatDialog,
    private psychologistService: PsychologistApiService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      gender: ['', Validators.required],
      numLicense: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]],
      specialization: ['', Validators.required],
      companyName: [''], // Optional or removed if not needed for psychologist
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  openLegal(ev: Event, which: 'terms' | 'privacy' | 'code') {
    ev.preventDefault();
    ev.stopPropagation();

    let comp: any;
    switch (which) {
      case 'terms': comp = TermsandconditionsModalComponent; break;
      case 'privacy': comp = PrivacyPolicyModalComponent; break;
      case 'code': comp = CodeModalComponent; break;
      default: return;
    }

    this.dialog.open(comp, { width: '720px', maxWidth: '96vw' })
      .afterClosed().subscribe(accepted => {
        if (which === 'terms' && accepted) {
          this.registerForm.get('acceptTerms')?.setValue(true);
          this.registerForm.get('acceptTerms')?.markAsTouched();
        }
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
      role: 'PSYCHOLOGIST'
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

            const staticPsychologistData: Psychologist = {
              id: 0,
              firstName: this.registerForm.value.firstName,
              lastName: this.registerForm.value.lastName,
              dni: this.registerForm.value.dni,
              phone: this.registerForm.value.phone,
              gender: this.registerForm.value.gender,
              licenseNumber: this.registerForm.value.numLicense,
              specialization: this.registerForm.value.specialization,
              userId: response.id
            } as any;

            // 4. Lógica de Creación de Perfil (Rol Psicólogo)
            console.log('Sending Psychologist Payload (Form Data):', JSON.stringify(staticPsychologistData, null, 2));
            this.psychologistService.post(staticPsychologistData).subscribe({
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
