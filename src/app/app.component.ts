import { Component} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import { ChatbotWidgetComponent } from './dashboard/components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ChatbotWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Frontend-Web-Applications';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

}
