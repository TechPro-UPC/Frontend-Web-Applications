import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PatientApiService } from '../../../profile/services/patient-api.service';
import { AccountApiService } from '../../../iam/services/accountApi.service';
import { Profile } from '../../models/profile.entity';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [MatIcon, RouterLink, MatButton, MatIconButton, NgIf, MatProgressSpinner, MatCard, TranslatePipe],
  templateUrl: './profile-client.component.html',
  styleUrls: ['./profile-client.component.css']
})
export class ProfileClientComponent implements OnInit {
  profile: Profile;
  isLoading = true;

  constructor(
    private profileService: PatientApiService,
    private accountService: AccountApiService,
    private router: Router
  ) {
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

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.accountService.logout();
    this.router.navigate(['/iam/login']);
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.warn('Delete account not implemented yet');
    }
  }
}
