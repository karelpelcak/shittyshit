import { useMemo } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { BookingContext } from '../store/booking/reducer';
import { FlexiResponse, RoutePayload } from './useConnectionRoute';
import { useManualApi } from './useManualApi';

enum FlexiType {
  Week = 'WEEK',
  Month = 'MONTH',
  Quarter = 'QUARTER',
}
const flexiTypes = [FlexiType.Week, FlexiType.Month, FlexiType.Quarter];

const useTimeTickets = () => {
  const departureDate = useContextSelector(
    BookingContext,
    c => c.state.booking?.connection.departureDate,
  );
  const [
    { data: flexiClassesWeek, loading: loadingWeek, error: errorWeek },
    fetchWeek,
  ] = useManualApi<FlexiResponse[]>({});
  const [
    { data: flexiClassesMonth, loading: loadingMonth, error: errorMonth },
    fetchMonth,
  ] = useManualApi<FlexiResponse[]>({});
  const [
    { data: flexiClassesQuarter, loading: loadingQuarter, error: errorQuarter },
    fetchQuarter,
  ] = useManualApi<FlexiResponse[]>({});

  const loading = loadingWeek || loadingMonth || loadingQuarter;
  const error = errorWeek || errorMonth || errorQuarter;

  const isFlexiLoaded = !!(
    flexiClassesWeek?.length &&
    flexiClassesMonth?.length &&
    flexiClassesQuarter?.length
  );

  const fetchRoute = async (
    {
      fromStationId,
      toStationId,
      tariffs,
      routeId,
    }: RoutePayload,
    signal?: GenericAbortSignal,
  ) => {
    await Promise.all(
      [fetchWeek({
        signal,
        url: `/pricelists/timeticket/${routeId}/${fromStationId}/${toStationId}/${FlexiType.Week}/${departureDate}/${tariffs[0]}`,
      }),
      fetchMonth({
        signal,
        url: `/pricelists/timeticket/${routeId}/${fromStationId}/${toStationId}/${FlexiType.Month}/${departureDate}/${tariffs[0]}`,
      }),
      fetchQuarter({
        signal,
        url: `/pricelists/timeticket/${routeId}/${fromStationId}/${toStationId}/${FlexiType.Quarter}/${departureDate}/${tariffs[0]}`,
      })],
    );
  };

  const data = useMemo(() =>
    (isFlexiLoaded ? [flexiClassesWeek, flexiClassesMonth, flexiClassesQuarter] : [])
      .flatMap(
        (flexiClasses, i) => flexiClasses.map(
          ({ price, seatClassKey, lineNumber, lineGroupCode }) => ({
            flexiType: flexiTypes[i],
            lineGroupCode,
            lineNumber,
            price,
            seatClassKey,
            type: 'FLEXI' as const,
          })),
      ), [isFlexiLoaded]);

  return { data, error, fetchRoute, loading };
};

export default useTimeTickets;