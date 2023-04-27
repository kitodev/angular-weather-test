import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountriesService } from '../../services/countries.service';
import {
    forkJoin,
    map,
    mergeMap,
    Observable,
    Subject,
    takeUntil,
    tap,
} from 'rxjs';
import { Country } from '../../models/country';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Weather } from '../../models/weather';
import { CountryAndWeather } from '../../models/countryAndWeather';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { DegreePipe } from "../../pipes/degree.pipe";

@Component({
    selector: 'current-weather-app-capitals',
    standalone: true,
    templateUrl: './capitals.component.html',
    styleUrls: ['./capitals.component.scss'],
    imports: [
        CommonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        RouterModule,
        DegreePipe
    ]
})
export class CapitalsComponent implements OnDestroy {
    countriesAndWeatherData$!: Observable<CountryAndWeather[]>;
    current!: CountryAndWeather;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private countriesService: CountriesService,
        private sharedService: SharedService
    ) {
        this.sharedService.actualCountryAndWeatherData$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (current) => {
                    if (current) {
                        this.current = current;

                        this.countriesAndWeatherData$ = this.countriesService
                            .getCapitals()
                            .pipe(
                                mergeMap((countries) =>
                                    forkJoin(
                                        countries.map((country) =>
                                            this.getWeatherData(country).pipe(
                                                map((weather) => {
                                                    weather.weather[0].icon = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;
                                                    return { country, weather };
                                                })
                                            )
                                        )
                                    )
                                ),
                                tap((data) => this.reorder(data, this.current))
                            );
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }

    reorder(
        countryAndWeatherList: CountryAndWeather[],
        currentCountry: CountryAndWeather
    ) {
        countryAndWeatherList.forEach(function (item, index) {
            if (item.country.cca2 === currentCountry.country.cca2) {
                countryAndWeatherList.splice(index, 1);
                countryAndWeatherList.unshift(item);
                return;
            }
        });
    }

    getWeatherData(country: Country): Observable<Weather> {
        return this.countriesService.getCurrentWeatherData(
            country.latlng[0],
            country.latlng[1]
        );
    }

    updateCountryAndWeatherData(selectedData: CountryAndWeather) {
        this.sharedService.updateCountryAndWeatherData(selectedData);
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
