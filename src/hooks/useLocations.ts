import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContext, useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { getErrorMessage, langPriorityCountries } from './consts';
import PersistContext from './PersistContext';
import { StationCountry } from './types';
import useSetResponseState from './useSetResponseState';
import { getPriorityInArray } from './utils';

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

const useLocations = (sort?: boolean) => {
  const language = useContextSelector(StoreContext, c => c.state.user.language);
  const priorityCountries = langPriorityCountries[language];
  const setState = useSetResponseState(
    ResponseStateCategory.locations,
  );
  const categoryState = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.locations],
  );

  const {
    locationsResponse: { error, loading },
    locations,
  } = useContext(PersistContext);

  const getStation = useCallback(
    (stationId: number) => {
      if (!locations) {
        return;
      }
      for (const city of locations) {
        for (const station of city.stations) {
          if (station.id === stationId) {
            return {
              ...station,
              cityId: city.id,
              cityName: city.name,
            };
          }
        }
      }
    },
    [locations],
  );

  const getCity = useCallback((cityId: number) =>
    locations?.find(c => c.id === cityId), [locations],
  );

  const getDestination = (destinationId: number) =>
    getStation(destinationId) ?? getCity(destinationId);

  const data = useMemo(() => {
    return sort ?
      locations
        ?.sort((a: { code: StationCountry }, b: { code: StationCountry }) =>
          getPriorityInArray(priorityCountries, a.code) -
          getPriorityInArray(priorityCountries, b.code),
        )
        .map(c => ({
          ...c,
          stations: c.stations.sort((a, b) => b.significance - a.significance),
        })) :
      locations;
  }, [locations]);

  useEffect(() => {
    setState(
      error?.response?.data?.message || getErrorMessage(error),
      !!loading,
    );
  }, [error, loading]);

  return { data, getCity, getDestination, getStation, ...categoryState };
};

export default useLocations;
