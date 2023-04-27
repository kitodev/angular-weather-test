import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../models/country';
import { Weather } from '../models/weather';
import { Forecast } from '../models/forecats';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root',
})
export class CountriesService {
    private openweathermapBaseUrl = 'https://api.openweathermap.org/data/2.5';
    private appId;

    constructor(
        private http: HttpClient,
        private configService: ConfigService
    ) {
        this.appId = configService.apiKey;
    }

    getCapitals(): Observable<Country[]> {
        return this.http.get<Country[]>(
            'https://restcountries.com/v3.1/region/europe?fields=capital,cca2,latlng,flags,capitalInfo,name'
        );
    }

    getCurrentWeatherData(lat: number, lon: number): Observable<Weather> {
        return this.http.get<Weather>(
            `${this.openweathermapBaseUrl}/weather${this.getQueryParams(
                lat,
                lon
            )}`
        );
    }

    getForecast(lat: number, lon: number): Observable<Forecast> {
        return this.http.get<Forecast>(
            `${this.openweathermapBaseUrl}/forecast${this.getQueryParams(
                lat,
                lon
            )}`
        );
    }

    private getQueryParams(lat: number, lon: number) {
        return `?lat=${lat}&lon=${lon}&units=metric&appid=${this.appId}`;
    }
}
