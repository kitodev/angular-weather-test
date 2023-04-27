export interface Country {
    name: {
        common: string;
        official: string;
    };
    capital: string[];
    cca2: string;
    latlng: number[];
    flags: {
        png: string;
        svg: string;
        alt: string;
    };
    capitalInfo: {
        latlng: number[];
    };
}
