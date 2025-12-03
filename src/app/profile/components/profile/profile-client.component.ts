import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientApiService } from '../../../profile/services/patient-api.service';
import { AccountApiService } from '../../../iam/services/accountApi.service';
import { Profile } from '../../models/profile.entity';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [MatIcon, ReactiveFormsModule, MatSlideToggle, MatFormField, RouterLink, MatButton, MatIconButton, NgIf, MatInput, MatError, MatProgressSpinner, MatProgressSpinner, MatLabel, MatCard, TranslatePipe],
  templateUrl: './profile-client.component.html',
  styleUrls: ['./profile-client.component.css']
})
export class ProfileClientComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  profile: Profile;
  isLoading = true;
  passwordsMatch = true;
  showCurrentPasswordField = false;

  constructor(
    private fb: FormBuilder,
    private profileService: PatientApiService,
    private accountService: AccountApiService
  ) {
    // Inicialización de formularios en el constructor
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      identityDocument: [''],
      notifications: [false],
      location: [false]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.profile = new Profile();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    const userId = Number(localStorage.getItem('clientId'));

    forkJoin({
      patient: this.profileService.getPatientByUserId(userId),
      account: this.accountService.getAccountById(userId)
    }).subscribe({
      next: ({ patient, account }) => {
        this.profile = new Profile();
        this.profile.accountId = patient.userId.toString();
        this.profile.name = `${patient.firstName} ${patient.lastName}`;
        this.profile.phoneNumber = patient.phone;
        this.profile.identityDocument = patient.dni;
        this.profile.email = account.email;

        this.updateForm(this.profile);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
      }
    });
  }

  updateForm(profile: Profile): void {
    this.profileForm.patchValue({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      identityDocument: profile.identityDocument,
      notifications: profile.notifications,
      location: profile.location
    });
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      const updatedProfile: Profile = {
        ...this.profile,
        ...this.profileForm.value
      };

      /*
      this.profileService.updateProfile(updatedProfile).subscribe({
        next: (result) => {
          console.log('Profile updated successfully');
          // Mostrar mensaje de éxito
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          // Mostrar mensaje de error
        }
      });
      */
      console.warn('Update profile not implemented yet');
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

      if (newPassword !== confirmPassword) {
        this.passwordsMatch = false;
        return;
      }

      this.passwordsMatch = true;
      /*
      this.profileService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          console.log('Password changed successfully');
          this.passwordForm.reset();
          this.showCurrentPasswordField = false;
          // Mostrar mensaje de éxito
        },
        error: (err) => {
          console.error('Error changing password:', err);
          // Mostrar mensaje de error
        }
      });
      */
      console.warn('Change password not implemented yet');
    }
  }

  logout(): void {
    this.accountService.logout();
    // Navigate to login
    // this.router.navigate(['/iam/login']);
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      /*
      this.profileService.deleteAccount().subscribe({
        next: () => {
          // Navegar a la página de login o manejar la eliminación de cuenta
        },
        error: (err) => {
          console.error('Error deleting account:', err);
        }
      });
      */
      console.warn('Delete account not implemented yet');
    }
  }
}
