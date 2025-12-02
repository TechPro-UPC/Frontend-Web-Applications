import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

    constructor(private psychologistService: PsychologistApiService) { }

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
        this.psychologistSelected.emit(psychologist);
    }
}
