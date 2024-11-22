import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import type { ResponseValues } from 'axios-hooks';
import { createContext, useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import { api } from './consts';
import { Language } from './types';
import {
  ConnectionSearchCity,
  LocationCountry,
  LocationStation,
} from './useLocations';
import { useApi } from './useManualApi';
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

const PersistContext = createContext<PersistProps>({} as PersistProps);

interface Props {
  children?: ReactNode;
  cache?: PersistContextCache;
}

export const flattenLocations = (
  locations: LocationCountry[],
): ConnectionSearchCity[] =>
  locations.flatMap((c) =>
    c.cities.map((city) => ({
      aliases: city.aliases,
      code: c.code,
      id: city.id,
      name: `${city.name}, ${c.country}`,
      placeType: 'CITY' as const,
      stations: city.stations.map((st: LocationStation) => ({
        ...st,
        aliases: [...st.aliases, ...city.aliases],
        countryCode: c.code,
        name: st.fullname,
        placeType: 'STATION' as const,
        types: st.stationsTypes,
      })),
    })),
  );

const useHandleApiResponse = <T extends keyof PersistContextCacheItem>(
  response: ResponseValues<any, any, any>,
  cacheKey: T,
  cacheRef: React.MutableRefObject<Language | undefined>,
  cache: PersistContextCache | undefined,
  language: Language,
) => {
  const data = response.data || cache?.getItem()[cacheKey];

  useEffect(() => {
    if (cache && cacheRef.current !== language && data) {
      cache.setItem({ [cacheKey]: data });
      cacheRef.current = language;
    }
  }, [data, language, cache]);

  return data;
};

const useHandleApiError = (
  response: ResponseValues<any, any, any>,
  refetch: () => void,
) => {
  useEffect(() => {
    if (!response.error) {
      return;
    }

    const interval = setInterval(refetch, 10_000);
    return () => clearInterval(interval);
  }, [response.error, refetch]);
};

export const PersistContextProvider: React.FC<Props> = ({
  cache,
  children,
}) => {
  const { language, currency } = useContextSelector(
    StoreContext,
    (c) => c.state.user,
  );

  const locationsCacheSetForLang = useRef<Language>();
  const tariffsCacheSetForLang = useRef<Language>();
  const seatClassesCacheSetForLang = useRef<Language>();
  const vehicleStandardsCacheSetForLang = useRef<Language>();

  useEffect(() => {
    api.defaults.headers.common['X-Lang'] =
      language === 'de-AT' ? 'at' : language;
    api.defaults.headers.common['X-Currency'] = currency;
  }, [language, currency]);

  const [locationsResponse, refetchLocations] =
    useApi<LocationCountry[]>('/consts/locations');
  const [tariffsResponse, refetchTariffs] =
    useApi<TariffResponse[]>('/consts/tariffs');
  const [seatClassesResponse, refetchSeatClasses] = useApi<SeatClassData[]>(
    '/consts/seatClasses',
  );
  const [vehicleStandardsResponse, refetchVehicleStandards] = useApi<VehicleStandard[]>(
    '/consts/vehicleStandards',
  );

  const fetchedForLanguage = useRef(language);

  useEffect(() => {
    if (fetchedForLanguage.current === language) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    Promise.all([
      refetchLocations({ signal }),
      refetchTariffs({ signal }),
      refetchSeatClasses({ signal }),
      refetchVehicleStandards({ signal }),
    ]).then(() => {
      fetchedForLanguage.current = language;
    });
    return () => {
      abortController.abort();
    };
  }, [
    language,
    refetchLocations,
    refetchSeatClasses,
    refetchTariffs,
    refetchVehicleStandards,
  ]);

  const locations = useMemo(() => {
    if (locationsResponse.data) {
      return flattenLocations(locationsResponse.data);
    }
    return cache?.getItem().locations;
  }, [locationsResponse.data, cache]);

  useEffect(() => {
    if (cache && locationsCacheSetForLang.current !== language && locations) {
      cache.setItem({ locations });
      locationsCacheSetForLang.current = language;
    }
  }, [locations, language, cache]);

  const tariffs = useHandleApiResponse(
    tariffsResponse,
    'tariffs',
    tariffsCacheSetForLang,
    cache,
    language,
  );
  const seatClasses = useHandleApiResponse(
    seatClassesResponse,
    'seatClasses',
    seatClassesCacheSetForLang,
    cache,
    language,
  );
  const vehicleStandards = useHandleApiResponse(
    vehicleStandardsResponse,
    'vehicleStandards',
    vehicleStandardsCacheSetForLang,
    cache,
    language,
  );

  useHandleApiError(locationsResponse, refetchLocations);
  useHandleApiError(tariffsResponse, refetchTariffs);
  useHandleApiError(seatClassesResponse, refetchSeatClasses);
  useHandleApiError(vehicleStandardsResponse, refetchVehicleStandards);

  return (
    <PersistContext.Provider
      value={{
        locations,
        locationsResponse,
        tariffs,
        tariffsResponse,
        seatClassesResponse,
        seatClasses,
        vehicleStandards,
        vehicleStandardsResponse,
      }}
    >
      {children}
    </PersistContext.Provider>
  );
};

export default PersistContext;
