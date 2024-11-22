import { DateString, VehicleKey } from './types';
export interface Departure {
    busConnectionId: number;
    label: string;
    number: null | string;
    delay: number;
    vehicleCategory: 'COACH' | 'RAIL_CAR';
    freeSeatsCount: number;
    connectionStations: ConnectionStation[];
    type: 'RJ' | 'R' | 'WB';
    vehicleStandard: VehicleKey;
}
export interface ConnectionStation {
    stationId: number;
    arrival: DateString | null;
    departure: DateString | null;
    platform: null | string;
    departingStation: boolean;
}
declare const useDepartures: (stationId: number, limit?: number) => {
    data: Departure[] | undefined;
    error: import("axios").AxiosError<any, any> | null;
    fetchDepartures: import("axios-hooks").RefetchFunction<any, Departure[]>;
    loading: boolean;
};
export default useDepartures;
