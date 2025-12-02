import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { RouterLink } from '@angular/router';
import { Psychologist } from '../../../profile/models/psychologist.entity';
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-toolbar-client',
  imports: [
    LanguageSwitcherComponent,
    RouterLink,
    MatAutocomplete,
    MatOption,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    TranslatePipe
  ],
  templateUrl: './toolbar-client.component.html',
  styleUrl: './toolbar-client.component.css'
})
export class ToolbarClientComponent implements OnInit {
  psychologists: Psychologist[] = [];
  myControl = new FormControl();
  filteredOptions: Psychologist[] = [];

  constructor(private psychologistService: PsychologistApiService, private router: Router) {

  }

  ngOnInit() {
    this.psychologistService.getAll().pipe(
      catchError(error => {
        console.error('Error loading psychologists in toolbar:', error);
        return of([]);
      })
    ).subscribe(psychologists => {
      this.psychologists = psychologists;
      this.filteredOptions = this.psychologists;
      console.log('Psychologists loaded:', this.psychologists);

      this.myControl.valueChanges.subscribe(value => {
        const filterValue = value?.toLowerCase?.() || '';
        this.filteredOptions = this.psychologists.filter(psychologist =>
          (psychologist.firstName + ' ' + psychologist.lastName).toLowerCase().includes(filterValue)
        );
      });
    });
  }

  onPsychologistSelected(psychologist: Psychologist) {
    if (psychologist && psychologist.id) {
      // Navigate to psychologist profile or schedule page
      // For now, let's assume we navigate to a profile page or similar
      // this.router.navigate(['/client/psychologist', psychologist.id]);
      console.log('Selected psychologist:', psychologist);
    }
  }
}
