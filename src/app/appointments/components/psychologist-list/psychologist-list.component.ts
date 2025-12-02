import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Psychologist } from '../../../profile/models/psychologist.entity';
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-psychologist-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './psychologist-list.component.html',
    styleUrls: ['./psychologist-list.component.css']
})
export class PsychologistListComponent implements OnInit {
    psychologists: Psychologist[] = [];
    @Output() psychologistSelected = new EventEmitter<Psychologist>();

    constructor(private psychologistService: PsychologistApiService, private router: Router) { }

    ngOnInit(): void {
        this.psychologistService.getAll().pipe(
            catchError(error => {
                console.error('Error loading psychologists list:', error);
                return of([]);
            })
        ).subscribe(data => {
            this.psychologists = data;
        });
    }

    selectPsychologist(psychologist: Psychologist): void {
        this.router.navigate(['/client/schedule-reservation', psychologist.id]);
    }
}
