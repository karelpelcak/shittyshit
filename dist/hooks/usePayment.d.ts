import type { GenericAbortSignal } from 'axios';
import { DateString, PaymentMethod, PaymentType, TicketState, TicketType } from './types';
import { PassengerFieldsFromApi, PassengerFieldsToSend } from './usePassengersData';
import { Tickets } from './useUserTickets';
export interface TicketTypeId {
    id: number;
    type: TicketType;
}
export interface Payment {
    paymentMethodCode: PaymentMethod;
    paymentType: PaymentType | null;
    rememberCardEnabled: boolean;
    active: boolean;
    description: string;
    deadline: DateString | null;
    deadlineAt: number | null;
}
export interface PaymentForm {
    fieldName: string;
    fieldType: PassengerFieldsFromApi;
}
export interface PayResponse {
    payRedirectUrl: string;
    regiojetRedirectUrl: string;
}
export interface AddGiftPayload {
    certificate: string;
    email: string;
}
export type BuyTicketsType = 'credit' | 'payment';
export interface BuyTicketsResponse {
    type: BuyTicketsType;
    url: string | null;
}
declare const usePayment: (tickets?: Tickets, credit?: boolean, ticketState?: TicketState) => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    addCreditByGift: (data: AddGiftPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    buyTickets: (rememberCard?: boolean, fields?: Partial<Record<PassengerFieldsToSend, string>>, boughtTickets?: TicketTypeId[] | undefined, fromCredit?: boolean, signal?: GenericAbortSignal, useCreditChargeWithFormFields?: boolean) => Promise<BuyTicketsResponse | null>;
    getPaymentForm: (ticket?: TicketTypeId, manualPaymentMethodCode?: PaymentMethod, signal?: GenericAbortSignal) => Promise<PaymentForm[] | undefined>;
    getPaymentMethods: (ticketsTypeIds?: TicketTypeId[], signal?: GenericAbortSignal) => Promise<void>;
    paymentForm: PaymentForm[] | undefined;
    paymentFormLoading: boolean;
    paymentMethodsLoading: boolean;
    paymentMethods: Payment[] | undefined;
    ticketsAvailable: boolean;
};
export default usePayment;
