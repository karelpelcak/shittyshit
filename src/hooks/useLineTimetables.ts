import { useEffect } from 'react';
import { DateString } from './types';
import { useApi, useManualApi } from './useManualApi';
import { TimetablesResponse } from './useTimetables';

export type LineCode = 'WEB' | 'WEB1';

export interface Station {
  stationId: number;
  departure: string;
  arrival: string;
  platform: string;
}

export interface TimetableSymbol {
  mark: string;
  description: string;
}

export interface TimeCodeItem {
  type: 'INCLUDING' | 'INCLUDING_ALSO' | 'EXCLUDING';
  from: DateString;
  to: DateString;
}

export interface TimeCode {
  mark: number;
  description: string;
  items: TimeCodeItem[];
}

const headers = { 'X-Application-Origin': 'WEB' };

export interface UseTimetablesParams {
  code: LineCode;
  number: number;
  timeTableId: number
}

const useLineTimetables = (
  { code, number, timeTableId }: UseTimetablesParams,
  fetchAdditionalInfo?: boolean,
) => {
  const [{ error, loading, data = [] }] = useApi<TimetablesResponse[]>({
    url: `/consts/timetables/${code}/${number}`,
    method: 'GET',
    headers,
  });

  const [{ data: symbols = [] }, fetchSymbols] = useManualApi<
  TimetableSymbol[]
  >({
    url: `/consts/timetables/${timeTableId}/symbols`,
    method: 'GET',
    headers,
  });

  const [{ data: timeCodes = [] }, fetchCodes] = useManualApi<TimeCode[]>({
    url: `/consts/timetables/${timeTableId}/time-codes`,
    method: 'GET',
    headers,
  });

  useEffect(() => {
    if (!fetchAdditionalInfo) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetchSymbols({ signal });
    fetchCodes({ signal });
    return () => {
      abortController.abort();
    };
  }, [fetchAdditionalInfo]);

  return { error, loading, data, symbols, timeCodes };
};

export default useLineTimetables;
