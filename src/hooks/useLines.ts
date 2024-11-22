import { DateString } from './types';
import { LineCode } from './useLineTimetables';
import { useApi } from './useManualApi';

export interface LineDetail {
  lineGroupCode: LineCode;
  lineNumber: number;
  name: string;
  timeTable: number;
  validFrom: DateString;
  validTo: DateString;
}

/**
 * Hook for handling line detail (timetables, valid from, valid to)
 * @param stationId
 */
const useLines = (stationId: number) => {
  const [{ data = [], loading }] = useApi<LineDetail[]>({
    url: `/consts/lines/${stationId}`,
    headers: { 'X-Application-Origin': 'WEB' },
    method: 'GET',
  });

  return {
    data: data.filter(({ lineGroupCode }) =>
      ['WEB', 'WEB1'].includes(lineGroupCode),
    ),
    loading,
  };
};

export default useLines;
