import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CountryAndWeather } from '../models/countryAndWeather';
import { Country } from '../models/country';
import { CountriesService } from './countries.service';

@Injectable({
    providedIn: 'root',
})
export class SharedService {
    private budapest: Country = {
        name: {
            common: 'Hungary',
            official: 'Hungary',
        },
        flags: {
            png: 'https://flagcdn.com/w320/hu.png',
            svg: 'https://flagcdn.com/hu.svg',
            alt: 'The flag of Hungary is composed of three equal horizontal bands of red, white and green.',
        },
        capitalInfo: {
            latlng: [47.5, 19.08],
        },
        cca2: 'HU',
        capital: ['Budapest'],
        latlng: [47, 20],
    };

    private countryAndWeatherData$ =
        new BehaviorSubject<CountryAndWeather | null>(null);
    actualCountryAndWeatherData$ = this.countryAndWeatherData$.asObservable();

    constructor(private countriesService: CountriesService) {
        this.countriesService
            .getCurrentWeatherData(
                this.budapest.latlng[0],
                this.budapest.latlng[1]
            )
            .pipe(
                map((response) => {
                    response.weather[0].icon = `https://openweathermap.org/img/wn/${response.weather[0].icon}.png`;
                    return response;
                })
            )
            .subscribe((weather) => {
                this.updateCountryAndWeatherData({
                    country: this.budapest,
                    weather,
                });
            });
    }

    updateCountryAndWeatherData(data: CountryAndWeather) {
        this.countryAndWeatherData$.next(data);
    }
}
