import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-support-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, TranslatePipe],
  templateUrl: './support-widget.component.html',
  styleUrls: ['./support-widget.component.css']
})
export class SupportWidgetComponent {
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
  }

  openWhatsApp() {
    // Número de WhatsApp de soporte (puedes cambiarlo)
    const phoneNumber = '+51986286384'; // Reemplaza con el número real
    const message = encodeURIComponent('Hola, necesito ayuda con Mind Bridge');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  sendEmail() {
    // Email de soporte (puedes cambiarlo)
    const email = 'support@mindbridge.com'; // Reemplaza con el email real
    const subject = encodeURIComponent('Solicitud de Soporte - Mind Bridge');
    const body = encodeURIComponent('Hola,\n\nNecesito ayuda con:\n\n');
    const emailUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(emailUrl);
  }
}