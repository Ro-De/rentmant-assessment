import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { itemSelectorResolver } from './app/resolvers/item-selector.resolver';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      {
        path: '',
        component: AppComponent,
        resolve: { data: itemSelectorResolver }
      }
    ])
  ]
});