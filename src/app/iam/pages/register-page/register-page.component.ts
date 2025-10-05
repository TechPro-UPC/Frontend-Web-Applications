import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterFormClientComponent } from '../../components/register-form-client/register-form-client.component';
import { RegisterFormProviderComponent } from '../../components/register-form-provider/register-form-provider.component';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { tsParticles, type ISourceOptions } from '@tsparticles/engine';
import { loadFull } from 'tsparticles';
import { LanguageSwitcherComponent } from '../../../public/components/language-switcher/language-switcher.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RegisterFormClientComponent,
    RegisterFormProviderComponent,
    FormsModule,
    NgIf,
    NgForOf,
    LanguageSwitcherComponent,
    TranslatePipe,
    MatButtonToggleModule
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent implements OnInit, OnDestroy, AfterViewInit {
  isProvider: boolean = false;
  slideImages: string[] = [
    'https://img.freepik.com/free-photo/mid-shot-woman-therapist-with-clipboard_23-2148759113.jpg?semt=ais_hybrid&w=740&q=80',
    'https://www.sacap.edu.za/wp-content/uploads/2022/06/clinical-psychologist-sacap.jpg',
    'https://media.voguearabia.com/photos/67c597e93d8274bba86f3f7b/1:1/w_1920,c_limit/490366172'
  ];

  activeIndex: number = 0;
  intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.slideImages.length;
    }, 5000);
  }

  async ngAfterViewInit() {
    await loadFull(tsParticles);
    await tsParticles.load({
      id: 'particles-js',
      options: this.particlesOptions
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  setSlide(index: number): void {
    this.activeIndex = index;
  }

  toggleForm(value: boolean) {
    this.isProvider = value;
  }

  private particlesOptions: ISourceOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 80, density: { enable: true, width: 800 } },
      color: { value: '#f3a3ff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: {
        value: { min: 2, max: 4 },
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        outModes: { default: 'out' }
      },
      links: { enable: false }
    },
    detectRetina: true
  };
}
