import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Config } from '../models/config';

const SETTINGS_LOCATION = './assets/config.json';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private config!: Config;

    constructor(private http: HttpClient) {}

    get apiKey() {
        return this.config?.openweathermap?.appId;
    }

    load(): Observable<Config> {
        return this.http
            .get<Config>(SETTINGS_LOCATION)
            .pipe(tap((response) => (this.config = response || {})));
    }
}
