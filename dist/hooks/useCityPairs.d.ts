import { VehicleType } from './types';
export interface CityPair {
    departureCityId: number;
    arrivalCityId: number;
    numberOfTransfers: number;
    transportTypes: VehicleType[];
    iataCodesForDepartureCity: string[];
    iataCodesForArrivalCity: string[];
}
declare const useCityPairs: (cityId: number) => {
    cityPairs: CityPair[];
    loading: boolean;
};
export default useCityPairs;
