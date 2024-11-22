import React, { ReactNode } from 'react';
import type { ResponseValues } from 'axios-hooks';
import { ConnectionSearchCity, LocationCountry } from './useLocations';
import type { SeatClassData } from './useSeatClasses';
import type { TariffResponse } from './useTariffs';
import type { VehicleStandard } from './useVehicleStandards';
interface PersistProps extends PersistContextCacheItem {
    locationsResponse: ResponseValues<LocationCountry[], any, any>;
    tariffsResponse: ResponseValues<TariffResponse[], any, any>;
    seatClassesResponse: ResponseValues<SeatClassData[], any, any>;
    vehicleStandardsResponse: ResponseValues<VehicleStandard[], any, any>;
}
export interface PersistContextCacheItem {
    locations?: ConnectionSearchCity[];
    tariffs?: TariffResponse[];
    seatClasses?: SeatClassData[];
    vehicleStandards?: VehicleStandard[];
}
export interface PersistContextCache {
    getItem: () => PersistContextCacheItem;
    setItem: (o: Partial<PersistContextCacheItem>) => void;
}
declare const PersistContext: import("use-context-selector").Context<PersistProps>;
interface Props {
    children?: ReactNode;
    cache?: PersistContextCache;
}
export declare const flattenLocations: (locations: LocationCountry[]) => ConnectionSearchCity[];
export declare const PersistContextProvider: React.FC<Props>;
export default PersistContext;
