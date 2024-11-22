import { DateString } from './types';
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
export interface UseTimetablesParams {
    code: LineCode;
    number: number;
    timeTableId: number;
}
declare const useLineTimetables: ({ code, number, timeTableId }: UseTimetablesParams, fetchAdditionalInfo?: boolean) => {
    error: import("axios").AxiosError<any, any> | null;
    loading: boolean;
    data: TimetablesResponse[];
    symbols: TimetableSymbol[];
    timeCodes: TimeCode[];
};
export default useLineTimetables;
