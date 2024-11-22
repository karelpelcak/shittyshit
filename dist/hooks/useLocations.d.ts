import { StationCountry } from './types';
export type StationType = 'BUS_STATION' | 'TRAIN_STATION';
export type LocationType = 'CITY' | 'STATION';
export interface StationCityCommons {
    aliases: string[];
    id: number;
    name: string;
    significance?: number;
}
export interface ConnectionSearchStation extends StationCityCommons {
    address: string;
    latitude: number;
    longitude: number;
    placeType: 'STATION';
    types: StationType[];
    countryCode: StationCountry;
}
export interface ConnectionSearchCity extends StationCityCommons {
    stations: (ConnectionSearchStation & LocationStation)[];
    placeType: 'CITY';
    code: StationCountry;
}
export interface LocationStation extends StationCityCommons {
    address: string;
    fullname: string;
    imageUrl: string | null;
    latitude: number;
    longitude: number;
    significance: number;
    stationsTypes: StationType[];
}
export interface LocationCity extends StationCityCommons {
    stations: LocationStation[];
}
export interface LocationCountry {
    country: string;
    code: StationCountry;
    cities: LocationCity[];
}
declare const useLocations: (sort?: boolean) => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    data: ConnectionSearchCity[] | undefined;
    getCity: (cityId: number) => ConnectionSearchCity | undefined;
    getDestination: (destinationId: number) => ConnectionSearchCity | {
        cityId: number;
        cityName: string;
        address: string;
        latitude: number;
        longitude: number;
        placeType: 'STATION';
        types: StationType[];
        countryCode: StationCountry;
        aliases: string[];
        id: number;
        name: string;
        significance: number;
        fullname: string;
        imageUrl: string | null;
        stationsTypes: StationType[];
    } | undefined;
    getStation: (stationId: number) => {
        cityId: number;
        cityName: string;
        address: string;
        latitude: number;
        longitude: number;
        placeType: 'STATION';
        types: StationType[];
        countryCode: StationCountry;
        aliases: string[];
        id: number;
        name: string;
        significance: number;
        fullname: string;
        imageUrl: string | null;
        stationsTypes: StationType[];
    } | undefined;
};
export default useLocations;
