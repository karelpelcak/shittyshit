import { DateString } from './types';
import { LineCode } from './useLineTimetables';
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
declare const useLines: (stationId: number) => {
    data: LineDetail[];
    loading: boolean;
};
export default useLines;
