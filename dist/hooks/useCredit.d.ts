import type { GenericAbortSignal } from 'axios';
import { PassengerFieldsToSend } from './usePassengersData';
import { TicketTypeId } from './usePayment';
import { Tickets } from './useUserTickets';
/**
 * Adding user credit
 */
declare const useCredit: (unpaidTickets: Tickets) => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    addCredit: (amount: number, rememberCard: boolean, chargeTickets?: boolean, tickets?: TicketTypeId[] | undefined, fields?: Partial<Record<PassengerFieldsToSend, string>>, signal?: GenericAbortSignal) => Promise<string | undefined>;
};
export default useCredit;
