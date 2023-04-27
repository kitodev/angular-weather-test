import {
    AfterViewInit,
    Component,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { CountriesService } from '../../services/countries.service';
import { BehaviorSubject, mergeMap, of, Subject, takeUntil } from 'rxjs';
import { CountryAndWeather } from '../../models/countryAndWeather';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Forecast } from '../../models/forecats';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { DegreePipe } from "../../pipes/degree.pipe";

@Component({
    selector: 'current-weather-app-weather',
    standalone: true,
    templateUrl: './weather.component.html',
    styleUrls: ['./weather.component.scss'],
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        RouterModule,
        MatCardModule,
        MatChipsModule,
        DegreePipe
    ]
})
export class WeatherComponent implements AfterViewInit, OnInit, OnDestroy {
    selectedCountryAndWeatherData!: CountryAndWeather;
    private root!: am5.Root;
    private chartData: { date: number; value: number; value2: number }[] = [];
    private dataUpdated$ = new BehaviorSubject<boolean>(false);
    private isDataUpdated$ = this.dataUpdated$.asObservable();
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private sharedService: SharedService,
        private countriesService: CountriesService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private zone: NgZone,
        private router: Router
    ) {}

    ngOnInit() {
        this.sharedService.actualCountryAndWeatherData$
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    if (result) {
                        this.selectedCountryAndWeatherData = result;
                        this.dataUpdated$.next(true);
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }

    ngAfterViewInit() {
        this.isDataUpdated$
            .pipe(
                takeUntil(this.destroy$),
                mergeMap((isUpdated) => {
                    if (isUpdated && this.router.url === '/weather') {
                        const lat =
                            this.selectedCountryAndWeatherData.country
                                ?.latlng[0];
                        const lon =
                            this.selectedCountryAndWeatherData.country
                                ?.latlng[0];

                        return this.countriesService.getForecast(lat, lon);
                    } else {
                        return of(null);
                    }
                })
            )
            .subscribe({
                next: (forecast) => {
                    if (forecast) {
                        this.prepareChartData(forecast);
                        this.buildChart();
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }

    browserOnly(f: () => void) {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => {
                f();
            });
        }
    }

    prepareChartData(forecastData: Forecast) {
        let min = 1000;
        let max = -1000;

        forecastData.list.forEach((forecast, index) => {
            const currentMin = forecast.main.temp_min;
            const currentMax = forecast.main.temp_max;

            min = currentMin < min ? currentMin : min;
            max = currentMax > max ? currentMax : max;

            if ((index + 1) % 8 === 0) {
                this.chartData.push({
                    date: forecast.dt * 1000,
                    value: min,
                    value2: max,
                });

                min = 1000;
                max = -1000;
            }
        });
    }

    buildChart() {
        this.browserOnly(() => {
            const root = am5.Root.new('chartdiv');

            root.setThemes([am5themes_Animated.new(root)]);

            const chart = root.container.children.push(
                am5xy.XYChart.new(root, {
                    panY: false,
                    wheelY: 'zoomX',
                    layout: root.verticalLayout,
                    maxTooltipDistance: 0,
                })
            );

            const yAxis = chart.yAxes.push(
                am5xy.ValueAxis.new(root, {
                    extraTooltipPrecision: 1,
                    baseValue: 2,
                    renderer: am5xy.AxisRendererY.new(root, {}),
                })
            );

            const xAxis = chart.xAxes.push(
                am5xy.DateAxis.new(root, {
                    baseInterval: {
                        timeUnit: 'day',
                        count: 1,
                    },
                    renderer: am5xy.AxisRendererX.new(root, {
                        minGridDistance: 20,
                    }),
                })
            );

            createSeries('Min temp', 'value', this.chartData);
            createSeries('Max temp', 'value2', this.chartData);

            chart.set(
                'cursor',
                am5xy.XYCursor.new(root, {
                    behavior: 'zoomXY',
                    xAxis: xAxis,
                })
            );

            xAxis.set(
                'tooltip',
                am5.Tooltip.new(root, {
                    themeTags: ['axis'],
                })
            );

            yAxis.set(
                'tooltip',
                am5.Tooltip.new(root, {
                    themeTags: ['axis'],
                })
            );

            function createSeries(
                name: string,
                field: string,
                data: unknown[]
            ) {
                const series = chart.series.push(
                    am5xy.LineSeries.new(root, {
                        name: name,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: field,
                        valueXField: 'date',
                        tooltip: am5.Tooltip.new(root, {}),
                    })
                );

                series.strokes.template.set('strokeWidth', 2);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                series
                    .get('tooltip')
                    .label.set(
                        'text',
                        '[bold]{name}[/]\n{valueX.formatDate()}: {valueY} C'
                    );
                series.data.setAll(data);
            }
        });
    }

    ngOnDestroy() {
        this.browserOnly(() => {
            if (this.root) {
                this.root.dispose();
            }
        });

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }
}
