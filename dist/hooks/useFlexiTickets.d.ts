import type { GenericAbortSignal } from 'axios';
import { FlexiResponse, RoutePayload } from './useConnectionRoute';
declare const useFlexiTickets: () => {
    data: FlexiResponse[] | undefined;
    fetchRoute: (params: RoutePayload, departureDate: string, signal?: GenericAbortSignal) => Promise<boolean>;
    loading: boolean;
};
export default useFlexiTickets;
