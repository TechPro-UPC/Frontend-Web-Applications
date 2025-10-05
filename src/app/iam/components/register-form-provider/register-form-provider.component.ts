import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AccountApiService, SignUpPayload, UserResource } from '../../services/accountApi.service';

import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input'; // (deja como lo tienes)
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Modales (ajusta rutas si tu árbol difiere)
import {TermsandconditionsModalComponent} from '../termsandconditions-modal/termsandconditions-modal.component';
import {NgIf} from '@angular/common';
import {PrivacyPolicyModalComponent} from '../privacypolicy-modal/privacypolicy-modal.component';
import {CodeModalComponent} from '../code-modal/code-modal.component';

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
  ],
  templateUrl: './register-form-provider.component.html',
  styleUrls: ['./register-form-provider.component.css']
})
export class RegisterFormProviderComponent {
  registerForm: FormGroup;
  isProvider = true;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private accountService: AccountApiService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      numColegiado: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  /**
   * Abre el modal correspondiente.
   * which = 'terms' -> abre Términos; si el usuario acepta, marca el checkbox acceptTerms.
   * which = 'privacy' -> abre Privacidad (no marca el checkbox).
   */
  openLegal(ev: Event, which: 'terms'|'privacy'|'code') {
    ev.preventDefault(); ev.stopPropagation();

    let comp: any;
    switch (which) {
      case 'terms':   comp = TermsandconditionsModalComponent; break;
      case 'privacy': comp = PrivacyPolicyModalComponent;     break;
      case 'code':    comp = CodeModalComponent;              break;
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
