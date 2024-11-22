import { ConnectionDirection } from '../store/booking/types';
import { DateString } from './types';
export interface TimetablesResponse {
    connectionCode: string;
    connectionId: number;
    direction?: ConnectionDirection;
    fromCityName: string;
    stations: Station[];
    symbols?: string[];
    timeCodes?: number[];
    timetableId: number;
    toCityName: string;
    validFrom: DateString;
    validTo: DateString;
    carrierId: number;
}
export interface Station {
    stationId: number;
    departure?: string;
    arrival?: string;
    platform?: string;
    symbols?: string[];
}
/**
 * Hook for handling line detail (all stations, coordinates, images etc.)
 * @param sectionId
 */
declare const useTimetables: (sectionId: number) => {
    error: import("axios").AxiosError<any, any> | null;
    loading: boolean;
    stations: {
        cityId: number;
        cityName: string;
        address: string;
        latitude: number;
        longitude: number;
        placeType: "STATION";
        types: import("./useLocations").StationType[];
        countryCode: import("./types").StationCountry;
        aliases: string[];
        id: number;
        name: string;
        significance: number;
        fullname: string;
        imageUrl: string | null;
        stationsTypes: import("./useLocations").StationType[];
        stationId: number;
        departure?: string | undefined;
        arrival?: string | undefined;
        platform?: string | undefined;
        symbols?: string[] | undefined;
    }[];
    fromCityName: string | undefined;
    toCityName: string | undefined;
    carrierId: number | undefined;
};
export default useTimetables;
