import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiLanguage } from './core/i18n/ui-language';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    inject(UiLanguage).init();
  }
}
