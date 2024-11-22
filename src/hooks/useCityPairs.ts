import { useEffect } from 'react';
import { VehicleType } from './types';
import { useManualApi } from './useManualApi';

export interface CityPair {
  departureCityId: number;
  arrivalCityId: number;
  numberOfTransfers: number;
  transportTypes: VehicleType[];
  iataCodesForDepartureCity: string[];
  iataCodesForArrivalCity: string[];
}

const useCityPairs = (cityId: number) => {
  const [{ data: cityPairs = [], loading }, fetchFromCityPairs] = useManualApi<
  CityPair[]
  >({ method: 'GET', url: '/consts/cityPairs' });

  useEffect(() => {
    if (!cityId) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetchFromCityPairs({ params: { fromCityId: cityId }, signal });
    return () => {
      abortController.abort();
    };
  }, [cityId]);

  return { cityPairs, loading };
};

export default useCityPairs;
