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
import {TermsandconditionsModalComponent} from '../termsandconditions-modal/termsandconditions-modal.component';
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
    NgIf
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
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      numLicense: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ]],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  openLegal(ev: Event, which: 'terms'|'privacy'|'code') {
    ev.preventDefault(); 
    ev.stopPropagation();

    let comp: any;
    switch (which) {
      case 'terms':   comp = TermsandconditionsModalComponent; break;
      case 'privacy': comp = PrivacyPolicyModalComponent; break;
      case 'code':    comp = CodeModalComponent; break;
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
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: 'PSYCHOLOGIST'
    };

    this.accountService.signUp(payload).subscribe({
      next: (user: UserResource) => {
        this.snackBar.open('Account created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        setTimeout(() => this.router.navigate(['/iam/login']), 1500);
      },
      error: () => {
        this.snackBar.open('Something went wrong. Try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
