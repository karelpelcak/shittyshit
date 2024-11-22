import { type GenericAbortSignal } from 'axios';
import { TicketTypeId } from './usePayment';
import { Tickets } from './useUserTickets';
declare const useTickets: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    fetchTickets: (ticketTypes: TicketTypeId[], signal?: GenericAbortSignal) => Promise<boolean>;
    tickets: Tickets | undefined;
};
export default useTickets;
