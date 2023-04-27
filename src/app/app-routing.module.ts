import { Routes } from '@angular/router';
import { CapitalsComponent } from './components/capitals/capitals.component';
import { WeatherComponent } from './components/weather/weather.component';

export const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/weather', pathMatch: 'full' },
    {
        path: 'capitals',
        component: CapitalsComponent,
    },
    {
        path: 'weather',
        component: WeatherComponent,
    },
];
