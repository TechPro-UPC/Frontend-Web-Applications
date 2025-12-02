import { Routes } from '@angular/router';
import { ProfessionalDashboardComponent } from './dashboard/pages/professional-dashboard/professional-dashboard.component';
import { ProfileSalonPageComponent } from './profile/pages/profile-page/profile-salon-page.component';
import { SchedulePageComponent } from './schedule/pages/schedule-page/schedule-page.component';
import { LoginPageComponent } from './iam/pages/login-page/login-page.component'
import { RegisterPageComponent } from './iam/pages/register-page/register-page.component'
import { ProviderLayoutComponent } from './public/components/provider-layout/provider-layout.component';
import { ClientLayoutComponent } from './public/components/client-layout/client-layout.component';
import {
  ClientAppointmentPagesComponent
} from './appointments/pages/client-appointment-pages/client-appointment-pages.component';
import { ClientFavoriteComponent } from './appointments/pages/client-favorite/client-favorite.component';
import { ClientProfileComponent } from './profile/pages/client-profile/client-profile.component';
import { ClientDashboardComponent } from './dashboard/pages/client-dashboard/client-dashboard.component';
import { SalonComponent } from './dashboard/pages/salon/salon.component';
import { ReviewsTabComponent } from './reviews/pages/reviews-tab/reviews-tab.component';
import { ServicesTabComponent } from './services/pages/services-tab/services-tab.component';
import { SettingsPageComponent } from './providerSettings/pages/settings-page/settings-page.component';
import { SubscriptionTabComponent } from './subscription/pages/subscription-tab/subscription-tab.component';
import { AppointmentMakerComponent } from './appointments/pages/appointment-maker/appointment-maker.component';
import { NotificationPageComponent } from './providerFeed/pages/notification-page/notification-page.component';
import { authGuard } from './iam/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'iam/login', pathMatch: 'full' },

  {
    path: 'iam',
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
    ]
  },

  {
    path: 'provider',
    component: ProviderLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'homeProvider', pathMatch: 'full' },
      { path: 'homeProvider', component: ProfessionalDashboardComponent },
      { path: 'profile', component: ProfileSalonPageComponent },
      { path: 'schedule', component: SchedulePageComponent },
      { path: 'reviews', component: ReviewsTabComponent },
      { path: 'services', component: ServicesTabComponent },
      { path: 'subscription', component: SubscriptionTabComponent },
      { path: 'settings', component: SettingsPageComponent },
      { path: 'notification', component: NotificationPageComponent }
    ]
  },

  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'homeClient', pathMatch: 'full' },
      { path: 'homeClient', component: ClientDashboardComponent },
      { path: 'appointment', component: ClientAppointmentPagesComponent },
      { path: 'appointment-maker/:id', component: AppointmentMakerComponent },
      { path: 'favorites', component: ClientFavoriteComponent },
      { path: 'profile', component: ClientProfileComponent },
      { path: 'schedule-reservation/:psychologistId', loadComponent: () => import('./schedule/pages/schedule-reservation/schedule-reservation.component').then(m => m.ScheduleReservationComponent) },
    ]
  },

  {
    path: 'client/homeClient',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'homeClient', pathMatch: 'full' },
      { path: 'salon/:id', component: SalonComponent }
    ]
  },

  { path: '**', redirectTo: 'iam/login' }
];
