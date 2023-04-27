import { Weather } from './weather';

export interface Forecast {
    cod: string;
    message: number;
    cnt: number;
    list: Weather[];
}
