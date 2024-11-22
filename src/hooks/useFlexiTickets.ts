import { useMemo } from 'react';
import type { GenericAbortSignal } from 'axios';
import { FlexiResponse, RoutePayload } from './useConnectionRoute';
import { useManualApi } from './useManualApi';
import { isRegional } from './utils';

const useFlexiTickets = () => {
  const [{ data, loading }, fetchClasses] = useManualApi<FlexiResponse[]>({});

  const fetchRoute =
    async (params: RoutePayload, departureDate: string, signal?: GenericAbortSignal) => {
      try {
        const { routeId, fromStationId, toStationId, tariffs } = params;

        if (!isRegional(fromStationId, toStationId) ||
          tariffs.length !== 1) {
          return true;
        }
        await fetchClasses({
          signal,
          url: `/pricelists/timeticket/${routeId}/${fromStationId}/${toStationId}/FLEX/${departureDate}/${tariffs[0]}`,
        });
        return true;
      } catch (e) {
        return false;
      }
    };

  return useMemo(() => ({
    data,
    fetchRoute,
    loading,
  }), [loading, data]);
};

export default useFlexiTickets;