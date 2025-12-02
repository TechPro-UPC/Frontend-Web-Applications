import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatCard, MatCardImage } from '@angular/material/card';
import { ProviderProfile } from '../../models/Salon.entity';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { Review } from '../../../reviews/models/review.entity';
import { ReviewApiService } from '../../../reviews/services/review-api.service';
import { SalonApiService } from '../../services/salon-api.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalonProfile } from '../../../profile/models/salon-profile.entity';
import { ProfileClientService } from '../../../profile/services/profile-api.service';
import { SalonProfileApiService } from '../../../profile/services/salon-profile-api.service';
import { ServiceListComponent } from "../../../services/components/service-list/service-list.component";
import { Service } from "../../../services/model/service.entity";
import { ServiceApiService } from "../../../services/services/services-api.service";
import { ProviderProfileAssembler } from '../../services/ProviderProfileAssembler';
import { ServiceAssembler } from '../../../services/services/service.assembler';

@Component({
  selector: 'app-salon',
  imports: [
    ReviewListComponent,
    MatCard,
    MatCardImage,
    MatButton,
    RouterLink,
    MatIcon,
    ServiceListComponent
  ],
  templateUrl: './salon.component.html',
  styleUrl: './salon.component.css'
})
export class SalonComponent implements OnInit {
  providerProfile!: ProviderProfile;
  @Input() profile!: SalonProfile;
  @Output() salonSelected = new EventEmitter<ProviderProfile>();

  reviews: Review[] = [];
  services: Service[] = [];
  selectedService: Service | undefined;

  constructor(private reviewService: ReviewApiService,
    private salonService: SalonApiService,
    private profileService: SalonProfileApiService,
    private serviceService: ServiceApiService,
    private router: ActivatedRoute) {
  }

  ngOnInit() {

    this.router.params.subscribe(params => {
      let salonId = Number(params['id']);

      this.salonService.getById(salonId).subscribe(salon => {
        this.providerProfile = ProviderProfileAssembler.toEntityFromResource(salon);
        console.log('Salon cargado:', this.providerProfile);

        // Cargar los reviews relacionados solo después de tener el salon
        this.reviewService.getReviewsByPsychologistId(this.providerProfile.providerId).subscribe(reviews => {
          this.reviews = reviews;
          console.log('Reviews filtrados:', this.reviews);
        });

        // Cargar los servicios relacionados solo después de tener el salon
        this.serviceService.getAll().subscribe(services => {
          this.services = ServiceAssembler
            .toEntitiesFromResponse(services)
            .filter(service => service.providerId === this.providerProfile.id);
          console.log('Servicios filtrados:', this.services);
        });

        // Puedes cargar también el perfil si lo necesitas después
        this.profileService.getProfileById(1).subscribe(profile => this.profile = profile);
      });
    })

  }

  setSelectedService(service: Service) {
    this.selectedService = service;
  }

}
