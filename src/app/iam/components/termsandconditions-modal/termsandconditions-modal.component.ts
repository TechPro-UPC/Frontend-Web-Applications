import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-termsandconditions-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './termsandconditions-modal.component.html',
  styleUrls: ['./termsandconditions-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsandconditionsModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title?: string }) {}
}
