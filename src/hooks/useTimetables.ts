import { ConnectionDirection } from '../store/booking/types';
import { DateString } from './types';
import useLocations from './useLocations';
import { useApi } from './useManualApi';

export interface TimetablesResponse {
  connectionCode: string;
  connectionId: number;
  direction?: ConnectionDirection;
  fromCityName: string;
  stations: Station[];
  symbols?: string[];
  timeCodes?: number[];
  timetableId: number;
  toCityName: string;
  validFrom: DateString;
  validTo: DateString;
  carrierId: number;
}

export interface Station {
  stationId: number;
  departure?: string;
  arrival?: string;
  platform?: string;
  symbols?: string[];
}

/**
 * Hook for handling line detail (all stations, coordinates, images etc.)
 * @param sectionId
 */
const useTimetables = (sectionId: number) => {
  const { getStation } = useLocations();
  const [{ error, loading, data }] = useApi<TimetablesResponse>({
    url: `/consts/timetables/${sectionId}`,
    method: 'GET',
  });

  const stations = (data?.stations || []).map((station) => ({
    ...station,
    ...getStation(station.stationId)!,
  }));

  return {
    error,
    loading,
    stations,
    fromCityName: data?.fromCityName,
    toCityName: data?.toCityName,
    carrierId: data?.carrierId,
  };
};

export default useTimetables;
