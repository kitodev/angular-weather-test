import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, importProvidersFrom, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app/app-routing.module';
import { ConfigService } from './app/services/config.service';

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(RouterModule.forRoot(APP_ROUTES)),
        importProvidersFrom(BrowserAnimationsModule),
        importProvidersFrom(HttpClientModule),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: () => {
                const configService = inject(ConfigService);
                return () => configService.load();
            },
        },
    ],
}).catch((err) => console.error(err));
