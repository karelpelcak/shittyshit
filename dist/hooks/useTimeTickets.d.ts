import type { GenericAbortSignal } from 'axios';
import { RoutePayload } from './useConnectionRoute';
declare enum FlexiType {
    Week = "WEEK",
    Month = "MONTH",
    Quarter = "QUARTER"
}
declare const useTimeTickets: () => {
    data: {
        flexiType: FlexiType;
        lineGroupCode: string;
        lineNumber: number;
        price: number;
        seatClassKey: import("./types").SeatClass;
        type: "FLEXI";
    }[];
    error: import("axios").AxiosError<any, any> | null;
    fetchRoute: ({ fromStationId, toStationId, tariffs, routeId, }: RoutePayload, signal?: GenericAbortSignal) => Promise<void>;
    loading: boolean;
};
export default useTimeTickets;
