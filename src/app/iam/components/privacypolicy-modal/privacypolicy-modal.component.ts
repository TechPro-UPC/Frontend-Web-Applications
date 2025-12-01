import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-privacypolicy-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './privacypolicy-modal.component.html',
  styleUrls: ['./privacypolicy-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title?: string }) {}
}