import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import { api } from './consts';
import { DateString, VehicleKey } from './types';
import { useApi } from './useManualApi';

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

const useDepartures = (stationId: number, limit = 10) => {
  const language = useContextSelector(
    StoreContext,
    (c) => c.state.user.language,
  );
  const [{ loading, error, data }, fetchDepartures] = useApi<Departure[]>({
    headers: { Accept: 'application/1.1.0+json' },
    method: 'GET',
    url: `/routes/${stationId}/departures?limit=${limit}`,
  });

  useEffect(() => {
    api.defaults.headers.common['X-Lang'] =
      language === 'de-AT' ? 'at' : language;
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetchDepartures({ signal });
    return () => {
      abortController.abort();
    };
  }, [language]);

  return { data, error, fetchDepartures, loading };
};

export default useDepartures;
