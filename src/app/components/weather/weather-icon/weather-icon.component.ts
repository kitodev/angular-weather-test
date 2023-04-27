import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-weather-icon',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weather-icon.component.html',
    styleUrls: ['./weather-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherIconComponent {
    @Input() iconId?: string;
}
