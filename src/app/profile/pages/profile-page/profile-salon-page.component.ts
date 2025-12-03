import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProfileHeaderComponent } from '../../components/profile-header/profile-header.component';
import { SalonProfile } from '../../models/salon-profile.entity';
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';
import { AccountApiService } from '../../../iam/services/accountApi.service';
import { ProfilePortfolioComponent } from '../../components/profile-portfolio/profile-portfolio.component';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  imports: [ProfileHeaderComponent, ProfilePortfolioComponent, ReviewListComponent, TranslatePipe],
  templateUrl: './profile-salon-page.component.html',
  styleUrl: './profile-salon-page.component.css'
})
export class ProfileSalonPageComponent implements OnInit {
  profile!: SalonProfile;

  constructor(
    private psychologistService: PsychologistApiService,
    private accountService: AccountApiService
  ) { }

  ngOnInit() {
    const userId = Number(localStorage.getItem('clientId'));

    forkJoin({
      psychologist: this.psychologistService.getPsychologistByUserId(userId),
      account: this.accountService.getAccountById(userId)
    }).subscribe({
      next: ({ psychologist, account }) => {
        this.profile = new SalonProfile();
        this.profile.id = psychologist.id;
        this.profile.providerId = psychologist.userId;
        this.profile.companyName = `${psychologist.firstName} ${psychologist.lastName}`;
        this.profile.email = account.email;
        this.profile.location = psychologist.specialization;
        this.profile.profileImageUrl = 'https://i.pravatar.cc/300'; // Default or placeholder
        this.profile.coverImageUrl = 'https://via.placeholder.com/800x200'; // Default or placeholder
        this.profile.socials = {};
        this.profile.portfolioImages = [];
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }
}
