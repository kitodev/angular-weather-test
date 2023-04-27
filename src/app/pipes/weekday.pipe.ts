import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'weekday',
    standalone: true
})
export class WeekDayPipe implements PipeTransform {
    private weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];

    public transform(day: number): string {
        return this.weekDays[day];
    }
}
