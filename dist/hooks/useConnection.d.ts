import type { GenericAbortSignal } from 'axios';
import { DateString, Tariff, VehicleKey } from './types';
import { RouteOverview } from './useConnectionRoute';
import { ActionPrice } from './useCreateTickets';
import { LocationType } from './useLocations';
export declare const croatiaNotSroStations: number[];
export interface ConnectionLocations {
    fromLocationId: number;
    fromLocationName?: string;
    fromLocationType: LocationType;
    toLocationId: number;
    toLocationName?: string;
    toLocationType: LocationType;
}
export interface ConnectionPayload extends ConnectionLocations {
    departureDate: DateString;
    returnDepartureDate?: DateString;
    tariffs: Tariff[];
}
export interface SroConnectionPayload {
    departureDate: DateString;
    fromLocationType: LocationType;
    fromLocation: number;
    numberOfPassengers: number;
    toLocationType: LocationType;
    toLocation: number;
}
export interface ConnectionRoute extends RouteOverview {
    actionPrice?: ActionPrice;
    surcharge: boolean;
    pricesCount: number;
    nationalTrip: boolean;
    vehicleStandards: VehicleKey[];
}
export interface Connection {
    routes: ConnectionRoute[];
    routesMessage: string | null;
    textBubbles: {
        id: number;
        text: string;
    }[];
}
declare const useConnection: () => {
    data: Connection | undefined;
    fetchBackwardRoutes: (headers?: Record<string, string | undefined>, signal?: GenericAbortSignal) => Promise<boolean>;
    fetchConnection: ({ returnDepartureDate, fromLocationName, toLocationName, departureDate, ...params }: ConnectionPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    fetchForwardRoutes: (headers?: Record<string, string | undefined>, signal?: GenericAbortSignal) => Promise<boolean>;
    fetchSroRoutes: (payload: SroConnectionPayload, signal?: GenericAbortSignal) => Promise<ConnectionRoute[]>;
    loading: boolean;
    shouldFindSro: boolean;
};
export default useConnection;
