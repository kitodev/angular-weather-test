import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'degree',
    standalone: true
})
export class DegreePipe implements PipeTransform {
    public transform(value?: number | string | null, degreeType: string = 'C'): string {
        const degreeTypeToShow = degreeType === 'none' ? '' : degreeType;

        return `${value ?? ''} °${degreeTypeToShow}`;
    }
}
